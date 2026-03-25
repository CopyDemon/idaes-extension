"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdaesTreeItem = exports.IdaesTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * A simple demo TreeDataProvider for the IDAES sidebar tree view.
 * Shows a static tree structure that you can expand/collapse.
 */
class IdaesTreeDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    // Demo data: a simple nested structure
    treeData = {
        'Flowsheet': {
            'Feed': { 'flow_mol': 100, 'temperature': 350 },
            'Flash': { 'heat_duty': 0, 'deltaP': 0 },
            'Product': { 'flow_mol': 50 },
        },
        'Solver Info': {
            'status': 'optimal',
            'iterations': 12,
            'time': 0.45,
        },
        'DOF': {
            'model': 0,
            'step_1': 0,
            'step_2': 0,
        }
    };
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level
            return Object.keys(this.treeData).map(key => {
                const value = this.treeData[key];
                const isLeaf = typeof value !== 'object' || value === null;
                return new IdaesTreeItem(key, isLeaf ? String(value) : undefined, isLeaf
                    ? vscode.TreeItemCollapsibleState.None
                    : vscode.TreeItemCollapsibleState.Collapsed, !isLeaf ? value : undefined);
            });
        }
        // Child level
        if (element.childData) {
            return Object.keys(element.childData).map(key => {
                const value = element.childData[key];
                const isLeaf = typeof value !== 'object' || value === null;
                return new IdaesTreeItem(key, isLeaf ? String(value) : undefined, isLeaf
                    ? vscode.TreeItemCollapsibleState.None
                    : vscode.TreeItemCollapsibleState.Collapsed, !isLeaf ? value : undefined);
            });
        }
        return [];
    }
    /**
     * Call this to update the tree data and refresh the view.
     */
    updateData(newData) {
        this.treeData = newData;
        this._onDidChangeTreeData.fire();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.IdaesTreeDataProvider = IdaesTreeDataProvider;
class IdaesTreeItem extends vscode.TreeItem {
    label;
    value;
    collapsibleState;
    childData;
    constructor(label, value, collapsibleState, childData) {
        super(label, collapsibleState);
        this.label = label;
        this.value = value;
        this.collapsibleState = collapsibleState;
        this.childData = childData;
        if (value !== undefined) {
            this.description = value;
        }
        // Set icon based on whether it's a leaf or branch
        if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.iconPath = new vscode.ThemeIcon('symbol-field');
        }
        else {
            this.iconPath = new vscode.ThemeIcon('symbol-class');
        }
    }
}
exports.IdaesTreeItem = IdaesTreeItem;
//# sourceMappingURL=idaes_tree_view.js.map