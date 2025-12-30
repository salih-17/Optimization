#!/usr/bin/env python3
"""
Container Optimization Script
Uses PuLP to solve a linear programming problem for optimal product selection
"""

import sys
import json
import pandas as pd
import pulp
import numpy as np


def normalize_minmax(series):
    """Normalize a series using min-max normalization"""
    series = series.astype(float)
    min_val, max_val = series.min(), series.max()
    if np.isclose(max_val, min_val):
        return pd.Series([0.5] * len(series))
    return (series - min_val) / (max_val - min_val)


def optimize_container(products_data, config):
    """
    Main optimization function
    
    Args:
        products_data: List of product dictionaries
        config: Dictionary with optimization configuration
    
    Returns:
        Dictionary with optimization results
    """
    # Extract configuration
    CONTAINER_VOLUME_M3 = config["CONTAINER_VOLUME_M3"]
    CONTAINER_MAX_WEIGHT_KG = config["CONTAINER_MAX_WEIGHT_KG"]
    AVAILABLE_BUDGET = config["AVAILABLE_BUDGET"]
    GLOBAL_LEAD_TIME_DAYS = config["GLOBAL_LEAD_TIME_DAYS"]
    w_profit = config["w_profit"]
    w_density = config["w_density"]
    w_velocity = config["w_velocity"]
    
    # Convert to DataFrame
    df = pd.DataFrame(products_data)
    
    # Ensure LeadTimeDays exists
    if "LeadTimeDays" not in df.columns:
        df["LeadTimeDays"] = GLOBAL_LEAD_TIME_DAYS
    
    # Fill missing values
    for col in ["MinShipQty", "CoverageDays", "SalesPerDay", "AvailableStock"]:
        if col not in df.columns:
            df[col] = 0
    
    # Calculate demand and order quantities
    df["DemandDuringLeadTime"] = df["SalesPerDay"] * df["LeadTimeDays"]
    df["DemandDuringCoverage"] = df["SalesPerDay"] * df["CoverageDays"]
    df["TotalNeeded"] = df["DemandDuringLeadTime"] + df["DemandDuringCoverage"]
    df["OrderQty"] = (df["TotalNeeded"] - df["AvailableStock"]).clip(lower=0).astype(int)
    df["MaxShippable"] = df["OrderQty"]
    
    # Calculate volume per box
    df["VolumePerBox_m3"] = df["BoxLength_m"] * df["BoxWidth_m"] * df["BoxHeight_m"]
    df["VolumePerBox_m3"] = df["VolumePerBox_m3"].replace(0, 1e-9)
    
    # Calculate profit per cubic meter
    df["ProfitPerCubicMeter"] = df["ProfitPerBox"] / df["VolumePerBox_m3"]
    
    # Normalize and calculate scores
    df["n_profit"] = normalize_minmax(df["ProfitPerBox"])
    df["n_density"] = normalize_minmax(df["ProfitPerCubicMeter"])
    df["n_velocity"] = normalize_minmax(df["SalesPerDay"])
    df["score"] = w_profit * df["n_profit"] + w_density * df["n_density"] + w_velocity * df["n_velocity"]
    
    # Create optimization model
    model = pulp.LpProblem("Container_Optimization", pulp.LpMaximize)
    
    # Decision variables
    x_vars = {}
    for idx, row in df.iterrows():
        upper_bound = int(row["MaxShippable"])
        x_vars[row["SKU"]] = pulp.LpVariable(
            f"x_{row['SKU']}", 
            lowBound=0, 
            upBound=upper_bound, 
            cat="Integer"
        )
    
    # Binary variables for minimum shipment quantity constraints
    y_vars = {}
    for idx, row in df.iterrows():
        y_vars[row["SKU"]] = pulp.LpVariable(f"y_{row['SKU']}", cat="Binary")
    
    # Objective: Maximize total score
    model += pulp.lpSum([
        df.loc[df["SKU"] == sku, "score"].iloc[0] * x_vars[sku] 
        for sku in df["SKU"]
    ]), "Total_Score"
    
    # Constraint: Volume
    model += pulp.lpSum([
        df.loc[df["SKU"] == sku, "VolumePerBox_m3"].iloc[0] * x_vars[sku] 
        for sku in df["SKU"]
    ]) <= CONTAINER_VOLUME_M3, "Volume_Constraint"
    
    # Constraint: Weight
    model += pulp.lpSum([
        df.loc[df["SKU"] == sku, "WeightPerBox_kg"].iloc[0] * x_vars[sku] 
        for sku in df["SKU"]
    ]) <= CONTAINER_MAX_WEIGHT_KG, "Weight_Constraint"
    
    # Constraint: Budget
    model += pulp.lpSum([
        df.loc[df["SKU"] == sku, "CostPerBox"].iloc[0] * x_vars[sku] 
        for sku in df["SKU"]
    ]) <= AVAILABLE_BUDGET, "Budget_Constraint"
    
    # Constraint: Minimum shipment quantities
    for idx, row in df.iterrows():
        sku = row["SKU"]
        min_qty = int(row["MinShipQty"])
        max_qty = int(row["MaxShippable"])
        
        # If y=1, then x >= min_qty; if y=0, then x = 0
        model += x_vars[sku] >= min_qty * y_vars[sku], f"MinQty_{sku}_lower"
        model += x_vars[sku] <= max_qty * y_vars[sku], f"MinQty_{sku}_upper"
    
    # Solve
    solver = pulp.PULP_CBC_CMD(msg=0)
    status = model.solve(solver)
    
    # Get status string
    status_map = {
        pulp.LpStatusOptimal: "Optimal",
        pulp.LpStatusInfeasible: "Infeasible",
        pulp.LpStatusUnbounded: "Unbounded",
        pulp.LpStatusUndefined: "Undefined",
        pulp.LpStatusNotSolved: "Error"
    }
    status_str = status_map.get(status, "Error")
    
    # Extract results
    results = {
        "status": status_str,
        "statusMessage": pulp.LpStatus[status],
        "totalBoxes": 0,
        "totalVolume_m3": 0.0,
        "volumeUtilization": 0.0,
        "totalWeight_kg": 0.0,
        "weightUtilization": 0.0,
        "totalCost": 0.0,
        "budgetUtilization": 0.0,
        "totalProfit": 0.0,
        "totalScore": 0.0,
        "selectedItems": []
    }
    
    if status == pulp.LpStatusOptimal:
        selected_items = []
        total_boxes = 0
        total_volume = 0.0
        total_weight = 0.0
        total_cost = 0.0
        total_profit = 0.0
        total_score = 0.0
        
        for idx, row in df.iterrows():
            sku = row["SKU"]
            selected_qty = int(x_vars[sku].varValue or 0)
            
            if selected_qty > 0:
                volume_used = selected_qty * row["VolumePerBox_m3"]
                weight_used = selected_qty * row["WeightPerBox_kg"]
                cost = selected_qty * row["CostPerBox"]
                profit = selected_qty * row["ProfitPerBox"]
                score_value = selected_qty * row["score"]
                
                total_boxes += selected_qty
                total_volume += volume_used
                total_weight += weight_used
                total_cost += cost
                total_profit += profit
                total_score += score_value
                
                selected_items.append({
                    "SKU": sku,
                    "Description": row["Description"],
                    "SelectedQty": selected_qty,
                    "VolumeUsed_m3": float(volume_used),
                    "WeightUsed_kg": float(weight_used),
                    "TotalCost": float(cost),
                    "TotalProfit": float(profit),
                    "Score": float(score_value),
                    "OrderQty": int(row["OrderQty"])
                })
        
        results.update({
            "totalBoxes": total_boxes,
            "totalVolume_m3": float(total_volume),
            "volumeUtilization": float((total_volume / CONTAINER_VOLUME_M3) * 100) if CONTAINER_VOLUME_M3 > 0 else 0,
            "totalWeight_kg": float(total_weight),
            "weightUtilization": float((total_weight / CONTAINER_MAX_WEIGHT_KG) * 100) if CONTAINER_MAX_WEIGHT_KG > 0 else 0,
            "totalCost": float(total_cost),
            "budgetUtilization": float((total_cost / AVAILABLE_BUDGET) * 100) if AVAILABLE_BUDGET > 0 else 0,
            "totalProfit": float(total_profit),
            "totalScore": float(total_score),
            "selectedItems": selected_items
        })
    
    return results


if __name__ == "__main__":
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    try:
        results = optimize_container(
            input_data["products"],
            input_data["config"]
        )
        print(json.dumps(results))
        sys.exit(0)
    except Exception as e:
        error_result = {
            "status": "Error",
            "statusMessage": str(e),
            "totalBoxes": 0,
            "totalVolume_m3": 0.0,
            "volumeUtilization": 0.0,
            "totalWeight_kg": 0.0,
            "weightUtilization": 0.0,
            "totalCost": 0.0,
            "budgetUtilization": 0.0,
            "totalProfit": 0.0,
            "totalScore": 0.0,
            "selectedItems": []
        }
        print(json.dumps(error_result))
        sys.exit(1)
