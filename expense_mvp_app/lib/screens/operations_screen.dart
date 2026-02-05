import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../config.dart';

class OperationItem {
  OperationItem({
    required this.id,
    required this.title,
    required this.amount,
    required this.type,
    required this.user,
    required this.datetime,
  });

  final int id;
  final String title;
  final double amount;
  final String type;
  final String user;
  final DateTime datetime;

  factory OperationItem.fromJson(Map<String, dynamic> json) {
    return OperationItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: json['title']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      type: json['type']?.toString() ?? 'expense',
      user: json['user']?.toString() ?? 'Ви',
      datetime: DateTime.tryParse(json['datetime']?.toString() ?? '') ??
          DateTime.now(),
    );
  }
}

class OperationsScreen extends StatefulWidget {
  const OperationsScreen({
    super.key,
    required this.groupName,
    required this.groupPath,
  });

  final String groupName;
  final List<String> groupPath;

  @override
  State<OperationsScreen> createState() => _OperationsScreenState();
}

class _OperationsScreenState extends State<OperationsScreen> {
  List<OperationItem> items = [];
  double total = 0;
  String month = DateFormat('yyyy-MM').format(DateTime.now());

  @override
  void initState() {
    super.initState();
    loadOps();
  }

  Future<void> loadOps() async {
    final pathValue = widget.groupPath.join('/');
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/ops?path=$pathValue&month=$month'),
      );
      if (response.statusCode >= 400) return;
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final list = (data['list'] as List<dynamic>? ?? data['items'] as List<dynamic>? ?? [])
          .map((item) => OperationItem.fromJson(item as Map<String, dynamic>))
          .toList();
      final totalValue = (data['total'] as num?)?.toDouble() ?? 0;
      setState(() {
        items = list;
        total = totalValue;
      });
    } catch (_) {}
  }

  Future<void> addOperation() async {
    final result = await showModalBottomSheet<AddOperationResult>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const AddOperationSheet(),
    );
    if (result == null) return;
    await http.post(
      Uri.parse('$baseUrl/op'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'amount': result.amount,
        'type': result.type,
        'user': result.user,
        'datetime': DateTime.now().toIso8601String(),
        'groupPath': widget.groupPath,
        'title': result.title,
      }),
    );
    await loadOps();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.groupName)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            DateFormat('MMMM yyyy', 'uk').format(DateTime.now()),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          for (final item in items)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(item.title, style: const TextStyle(fontSize: 16)),
                        Text(item.user),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(DateFormat('HH:mm  dd.MM.yy').format(item.datetime)),
                    const SizedBox(height: 4),
                    Text(
                      '${item.type == 'income' ? '+' : '-'}${item.amount.toStringAsFixed(2)} грн',
                      style: TextStyle(
                        color: item.type == 'income' ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 12),
          ListTile(
            title: const Text('Загальна сума:'),
            trailing: Text(total.toStringAsFixed(2)),
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade200),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: OutlinedButton(
              onPressed: addOperation,
              child: const Text('Додати покупку'),
            ),
          ),
        ],
      ),
    );
  }
}

class AddOperationResult {
  AddOperationResult({
    required this.title,
    required this.amount,
    required this.type,
    required this.user,
  });

  final String title;
  final double amount;
  final String type;
  final String user;
}

class AddOperationSheet extends StatefulWidget {
  const AddOperationSheet({super.key});

  @override
  State<AddOperationSheet> createState() => _AddOperationSheetState();
}

class _AddOperationSheetState extends State<AddOperationSheet> {
  final titleController = TextEditingController();
  final amountController = TextEditingController();
  String type = 'expense';
  String user = 'Ви';

  @override
  void dispose() {
    titleController.dispose();
    amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: titleController,
            decoration: const InputDecoration(labelText: 'Короткий опис'),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Сума'),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: type,
            items: const [
              DropdownMenuItem(value: 'expense', child: Text('Витрата')),
              DropdownMenuItem(value: 'income', child: Text('Зарахування')),
            ],
            onChanged: (value) {
              if (value != null) setState(() => type = value);
            },
            decoration: const InputDecoration(labelText: 'Тип'),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: user,
            items: const [
              DropdownMenuItem(value: 'Ви', child: Text('Ви')),
            ],
            onChanged: (value) {
              if (value != null) setState(() => user = value);
            },
            decoration: const InputDecoration(labelText: 'Учасник'),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () {
              final title = titleController.text.trim();
              final amount =
                  double.tryParse(amountController.text.replaceAll(',', '.'));
              if (title.isEmpty || amount == null) return;
              Navigator.of(context).pop(
                AddOperationResult(
                  title: title,
                  amount: amount,
                  type: type,
                  user: user,
                ),
              );
            },
            child: const Text('Зберегти'),
          ),
        ],
      ),
    );
  }
}
