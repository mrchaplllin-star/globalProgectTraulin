class TreeNode {
  TreeNode({required this.name, required this.children});

  final String name;
  final List<TreeNode> children;

  factory TreeNode.fromJson(Map<String, dynamic> json) {
    final children = (json['children'] as List<dynamic>? ?? [])
        .map((child) => TreeNode.fromJson(child as Map<String, dynamic>))
        .toList();
    return TreeNode(name: json['name'] as String, children: children);
  }
}
