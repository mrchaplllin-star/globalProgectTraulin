import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Expense MVP',
      theme: ThemeData(useMaterial3: true),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final String baseUrl = "http://192.168.0.185:8080";

  List<dynamic> expenses = [];
  List<dynamic> stats = [];

  final titleCtrl = TextEditingController();
  final amountCtrl = TextEditingController();
  final categoryCtrl = TextEditingController(text: "Транспорт");

  Future<void> loadAll() async {
    final ex = await http.get(Uri.parse("$baseUrl/expenses"));
    final st = await http.get(
      Uri.parse("$baseUrl/stats/${DateFormat('yyyy-MM').format(DateTime.now())}"),
    );

    setState(() {
      expenses = jsonDecode(ex.body);
      stats = jsonDecode(st.body);
    });
  }

  Future<void> addExpense() async {
    final title = titleCtrl.text.trim();
    final amount = double.tryParse(amountCtrl.text.replaceAll(',', '.'));
    final category = categoryCtrl.text.trim();

    if (title.isEmpty || amount == null || category.isEmpty) return;

    await http.post(
      Uri.parse("$baseUrl/expenses"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "title": title,
        "amount": amount,
        "category": category,
        "date": DateFormat('yyyy-MM-dd').format(DateTime.now()),
      }),
    );

    titleCtrl.clear();
    amountCtrl.clear();
    await loadAll();
  }

  @override
  void initState() {
    super.initState();
    loadAll();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Expense MVP (LAN)")),
      body: RefreshIndicator(
        onRefresh: loadAll,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    const Text("Додати витрату", style: TextStyle(fontSize: 18)),
                    TextField(
                      controller: titleCtrl,
                      decoration: const InputDecoration(labelText: "Назва"),
                    ),
                    TextField(
                      controller: amountCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: "Сума"),
                    ),
                    TextField(
                      controller: categoryCtrl,
                      decoration: const InputDecoration(labelText: "Категорія"),
                    ),
                    const SizedBox(height: 8),
                    FilledButton(
                      onPressed: addExpense,
                      child: const Text("Додати"),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text("Статистика за місяць", style: TextStyle(fontSize: 18)),
            for (final s in stats)
              ListTile(
                title: Text(s["category"]),
                trailing: Text(s["total"].toString()),
              ),
            const SizedBox(height: 12),
            const Text("Останні витрати", style: TextStyle(fontSize: 18)),
            for (final e in expenses)
              ListTile(
                title: Text("${e["title"]} — ${e["amount"]}"),
                subtitle: Text("${e["category"]} • ${e["date"]}"),
              ),
          ],
        ),
      ),
    );
  }
}
