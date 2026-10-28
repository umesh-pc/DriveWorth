import json

MODEL_PATH = r"d:\DriveWorth\model\saved_models_filtered\xgboost_filtered.json"
from xgboost import XGBRegressor

xgb_model = XGBRegressor()
xgb_model.load_model(MODEL_PATH)
booster = xgb_model.get_booster()
trees = booster.get_dump(dump_format='json')

def print_tree(tree_dict, indent=""):
    node_id = tree_dict.get('nodeid')
    if 'leaf' in tree_dict:
        print(f"{indent}Leaf {node_id}: value = {tree_dict['leaf']:.5f}")
    else:
        split = tree_dict['split']
        cond = tree_dict['split_condition']
        yes = tree_dict['yes']
        no = tree_dict['no']
        print(f"{indent}Node {node_id}: [{split} < {cond:.3f}] -> Yes: Node {yes}, No: Node {no}")
        for child in tree_dict.get('children', []):
            print_tree(child, indent + "  ")

print("=== TREE #151 ===")
print_tree(json.loads(trees[151]))

print("\n=== TREE #196 ===")
print_tree(json.loads(trees[196]))
