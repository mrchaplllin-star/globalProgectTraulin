import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/tree_node.dart';

class GroupScreen extends StatelessWidget {
  const GroupScreen({
    super.key,
    required this.title,
    required this.path,
    required this.node,
  });

  final String title;
  final List<String> path;
  final TreeNode node;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            path.join(' - '),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          ...node.children.map(
            (child) => ListTile(
              title: Text(child.name),
              trailing: const Icon(Icons.chevron_right),
              onTap: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => GroupScreen(
                      title: child.name,
                      path: [...path, child.name],
                      node: child,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: OutlinedButton(
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => GroupEditScreen(
                      parentPath: path,
                      parentName: title,
                    ),
                  ),
                );
              },
              child: const Text('(Додати)'),
            ),
          ),
        ],
      ),
    );
  }
}

class GroupEditScreen extends StatefulWidget {
  const GroupEditScreen({
    super.key,
    required this.parentPath,
    required this.parentName,
  });

  final List<String> parentPath;
  final String parentName;

  @override
  State<GroupEditScreen> createState() => _GroupEditScreenState();
}

class _GroupEditScreenState extends State<GroupEditScreen> {
  final nameController = TextEditingController();
  final descController = TextEditingController();
  bool isLeaf = false;
  String commandName = '';
  String commandType = 'expense';
  final List<String> phrases = [];

  @override
  void dispose() {
    nameController.dispose();
    descController.dispose();
    super.dispose();
  }

  Future<void> saveGroup() async {
    final name = nameController.text.trim();
    if (name.isEmpty) return;
    await http.post(
      Uri.parse('$baseUrl/group'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'path': widget.parentPath,
        'name': name,
        'description': descController.text.trim(),
        'isLeaf': isLeaf,
      }),
    );
    await http.post(
      Uri.parse('$baseUrl/group/commands'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'path': [...widget.parentPath, name],
        'name': commandName,
        'type': commandType,
        'phrases': phrases,
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Редагування')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(widget.parentName, style: Theme.of(context).textTheme.titleLarge),
          Text(widget.parentPath.join(' - ')),
          const SizedBox(height: 12),
          TextField(
            controller: nameController,
            decoration: const InputDecoration(labelText: 'Назва категорії'),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: descController,
            decoration: const InputDecoration(labelText: 'Короткий опис'),
          ),
          const SizedBox(height: 12),
          ListTile(
            title: const Text('Команди'),
            trailing: const Icon(Icons.edit),
            onTap: () async {
              final result = await showDialog<CommandsResult>(
                context: context,
                builder: (_) => CommandsPopup(
                  name: commandName,
                  type: commandType,
                  phrases: phrases,
                ),
              );
              if (result != null) {
                setState(() {
                  commandName = result.name;
                  commandType = result.type;
                  phrases
                    ..clear()
                    ..addAll(result.phrases);
                });
              }
            },
          ),
          SwitchListTile(
            title: const Text('Встановити як кінцеву категорію'),
            value: isLeaf,
            onChanged: (value) {
              setState(() {
                isLeaf = value;
              });
            },
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    await saveGroup();
                    if (mounted) Navigator.of(context).pop();
                  },
                  child: const Text('Зберегти'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    final name = nameController.text.trim();
                    if (name.isEmpty) return;
                    await http.delete(
                      Uri.parse('$baseUrl/group'),
                      headers: {'Content-Type': 'application/json'},
                      body: jsonEncode({
                        'path': [...widget.parentPath, name],
                        'confirm': true,
                      }),
                    );
                    if (mounted) Navigator.of(context).pop();
                  },
                  child: const Text('Видалити'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class CommandsResult {
  CommandsResult({required this.name, required this.type, required this.phrases});

  final String name;
  final String type;
  final List<String> phrases;
}

class CommandsPopup extends StatefulWidget {
  const CommandsPopup({
    super.key,
    required this.name,
    required this.type,
    required this.phrases,
  });

  final String name;
  final String type;
  final List<String> phrases;

  @override
  State<CommandsPopup> createState() => _CommandsPopupState();
}

class _CommandsPopupState extends State<CommandsPopup> {
  late TextEditingController nameController;
  late TextEditingController phraseController;
  late String type;
  late List<String> phrases;

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController(text: widget.name);
    phraseController = TextEditingController();
    type = widget.type;
    phrases = List.from(widget.phrases);
  }

  @override
  void dispose() {
    nameController.dispose();
    phraseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Налаштування команд'),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Назва команди'),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(hintText: 'Впиши назву'),
            ),
            const SizedBox(height: 12),
            const Text('Тип команди'),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => type = 'expense'),
                    child: const Text('Витрата'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => type = 'income'),
                    child: const Text('Зарахування'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text('Додати команду'),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: phraseController,
                    decoration: const InputDecoration(
                      hintText: 'Додати голосову команду',
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () {
                    final value = phraseController.text.trim();
                    if (value.isEmpty) return;
                    setState(() {
                      phrases.add(value);
                    });
                    phraseController.clear();
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
            for (final phrase in phrases)
              ListTile(
                title: Text(phrase),
                trailing: IconButton(
                  icon: const Icon(Icons.remove),
                  onPressed: () {
                    setState(() {
                      phrases.remove(phrase);
                    });
                  },
                ),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Видалити'),
        ),
        FilledButton(
          onPressed: () {
            Navigator.of(context).pop(
              CommandsResult(
                name: nameController.text.trim(),
                type: type,
                phrases: phrases,
              ),
            );
          },
          child: const Text('Зберегти'),
        ),
      ],
    );
  }
}
