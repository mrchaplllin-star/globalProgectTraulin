import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF3C4FD6),
      brightness: Brightness.light,
      background: const Color(0xFFF5F6FA),
    );

    return MaterialApp(
      title: 'Expense MVP',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
        scaffoldBackgroundColor: colorScheme.background,
        appBarTheme: AppBarTheme(
          centerTitle: true,
          elevation: 0,
          backgroundColor: colorScheme.background,
          foregroundColor: colorScheme.onBackground,
        ),
        cardTheme: CardTheme(
          elevation: 0,
          color: Colors.white,
          margin: const EdgeInsets.symmetric(vertical: 6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.shade200),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
        ),
      ),
      home: const HomePage(),
    );
  }
}

class CategoryNode {
  const CategoryNode(this.title, [this.children = const []]);

  final String title;
  final List<CategoryNode> children;

  bool get isLeaf => children.isEmpty;

  List<CategoryNode> get leafNodes {
    if (isLeaf) return [this];
    return children.expand((child) => child.leafNodes).toList();
  }
}

const List<CategoryNode> rootCategories = [
  CategoryNode('Транспорт', [
    CategoryNode('Громадський транспорт', [
      CategoryNode('Поїзд'),
      CategoryNode('Маршрутка'),
      CategoryNode('Літак'),
      CategoryNode('Таксі'),
    ]),
    CategoryNode('Власне авто', [
      CategoryNode('Бензин'),
      CategoryNode('Ремонт'),
    ]),
  ]),
  CategoryNode('Закупка', [
    CategoryNode('Продукти'),
    CategoryNode('Хімія'),
    CategoryNode('Гігієна'),
    CategoryNode('Косметика'),
    CategoryNode('Одяг'),
  ]),
  CategoryNode('Краса', [
    CategoryNode('Біжутерія'),
    CategoryNode('Салон'),
    CategoryNode('Гігієна'),
    CategoryNode('Косметика'),
  ]),
  CategoryNode('Здоровя', [
    CategoryNode('Лікарня'),
    CategoryNode('Аптека'),
  ]),
  CategoryNode('Підписки', [
    CategoryNode('Sim-карта'),
    CategoryNode('Інтернет'),
    CategoryNode('Ютуб'),
  ]),
  CategoryNode('Дозвілля', [
    CategoryNode('Ресторація'),
    CategoryNode('Подарунок'),
  ]),
  CategoryNode('Дім', [
    CategoryNode('Оренда'),
    CategoryNode('Комунальні'),
    CategoryNode('Ремонт'),
    CategoryNode('Декор'),
  ]),
];

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final String baseUrl = "http://192.168.0.185:8080";

  List<dynamic> expenses = [];
  String? loadError;
  final Map<int, String> expensePeople = {};
  final List<String> people = ['Ви'];

  Future<void> loadAll() async {
    try {
      final response = await http.get(Uri.parse("$baseUrl/expenses"));
      if (response.statusCode >= 400) {
        throw Exception('Server error');
      }
      setState(() {
        expenses = jsonDecode(response.body);
        loadError = null;
      });
    } catch (error) {
      setState(() {
        loadError = "Помилка завантаження даних. Перевірте підключення.";
      });
    }
  }

  double totalForNode(CategoryNode node) {
    final leafTitles = node.leafNodes.map((leaf) => leaf.title).toSet();
    return expenses.fold<double>(0, (sum, item) {
      final category = item["category"]?.toString();
      final amount = (item["amount"] as num?)?.toDouble() ?? 0;
      if (category != null && leafTitles.contains(category)) {
        return sum + amount;
      }
      return sum;
    });
  }

  double totalForAll() {
    return expenses.fold<double>(0, (sum, item) {
      final amount = (item["amount"] as num?)?.toDouble() ?? 0;
      return sum + amount;
    });
  }

  void addPerson(String name) {
    if (name.trim().isEmpty) return;
    setState(() {
      people.add(name.trim());
    });
  }

  @override
  void initState() {
    super.initState();
    loadAll();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Головна"),
      ),
      body: RefreshIndicator(
        onRefresh: loadAll,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (loadError != null)
              Text(
                loadError!,
                style: const TextStyle(color: Colors.red),
              ),
            Text(
              DateFormat('MMMM yyyy', 'uk').format(DateTime.now()),
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            Center(
              child: BalanceCircle(
                title: 'Баланс',
                value: totalForAll(),
              ),
            ),
            const SizedBox(height: 24),
            Wrap(
              spacing: 16,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: [
                CategoryCircle(
                  title: 'Сімя',
                  color: Colors.grey.shade200,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => FamilyPage(
                          people: people,
                          onAdd: addPerson,
                        ),
                      ),
                    );
                  },
                ),
                ...rootCategories.map(
                  (category) => CategoryCircle(
                    title: category.title,
                    color: Colors.primaries[
                        category.title.hashCode % Colors.primaries.length],
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => CategoryNodePage(
                            node: category,
                            expenses: expenses,
                            totalForNode: totalForNode,
                            people: people,
                            expensePeople: expensePeople,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Center(
              child: OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                child: const Text('Додати категорію'),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddExpense(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  Future<void> _showAddExpense(BuildContext context) async {
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    String? selectedCategory;
    final leafCategories = rootCategories
        .expand((node) => node.leafNodes)
        .map((node) => node.title)
        .toList();

    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Додати витрату'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleCtrl,
              decoration: const InputDecoration(labelText: 'Назва'),
            ),
            TextField(
              controller: amountCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Сума'),
            ),
            DropdownButtonFormField<String>(
              value: selectedCategory,
              items: leafCategories
                  .map(
                    (category) => DropdownMenuItem(
                      value: category,
                      child: Text(category),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                selectedCategory = value;
              },
              decoration: const InputDecoration(labelText: 'Категорія'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Скасувати'),
          ),
          FilledButton(
            onPressed: () async {
              final title = titleCtrl.text.trim();
              final amount =
                  double.tryParse(amountCtrl.text.replaceAll(',', '.'));
              if (title.isEmpty || amount == null || selectedCategory == null) {
                return;
              }
              try {
                final response = await http.post(
                  Uri.parse("$baseUrl/expenses"),
                  headers: {"Content-Type": "application/json"},
                  body: jsonEncode({
                    "title": title,
                    "amount": amount,
                    "category": selectedCategory,
                    "date": DateFormat('yyyy-MM-dd').format(DateTime.now()),
                  }),
                );
                if (response.statusCode >= 400) {
                  throw Exception('Server error');
                }
                if (mounted) {
                  Navigator.of(context).pop();
                  await loadAll();
                }
              } catch (error) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Не вдалося додати витрату.')),
                  );
                }
              }
            },
            child: const Text('Додати'),
          ),
        ],
      ),
    );
  }
}

class CategoryNodePage extends StatelessWidget {
  const CategoryNodePage({
    super.key,
    required this.node,
    required this.expenses,
    required this.totalForNode,
    required this.people,
    required this.expensePeople,
  });

  final CategoryNode node;
  final List<dynamic> expenses;
  final double Function(CategoryNode) totalForNode;
  final List<String> people;
  final Map<int, String> expensePeople;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(
        title: Text(node.title),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            DateFormat('MMMM yyyy', 'uk').format(DateTime.now()),
            textAlign: TextAlign.center,
            style: textTheme.titleMedium,
          ),
          const SizedBox(height: 16),
          Center(
            child: BalanceCircle(
              title: 'Баланс',
              value: totalForNode(node),
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            alignment: WrapAlignment.center,
            children: node.children
                .map(
                  (child) => CategoryCircle(
                    title: child.title,
                    color: Colors.grey.shade200,
                    onTap: () {
                      if (child.isLeaf) {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => ExpenseListPage(
                              node: child,
                              expenses: expenses,
                              people: people,
                              expensePeople: expensePeople,
                            ),
                          ),
                        );
                      } else {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => CategoryNodePage(
                              node: child,
                              expenses: expenses,
                              totalForNode: totalForNode,
                              people: people,
                              expensePeople: expensePeople,
                            ),
                          ),
                        );
                      }
                    },
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 24),
          Center(
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              child: const Text('Додати категорію'),
            ),
          ),
        ],
      ),
    );
  }
}

class ExpenseListPage extends StatefulWidget {
  const ExpenseListPage({
    super.key,
    required this.node,
    required this.expenses,
    required this.people,
    required this.expensePeople,
  });

  final CategoryNode node;
  final List<dynamic> expenses;
  final List<String> people;
  final Map<int, String> expensePeople;

  @override
  State<ExpenseListPage> createState() => _ExpenseListPageState();
}

class _ExpenseListPageState extends State<ExpenseListPage> {
  String? selectedPerson;

  @override
  Widget build(BuildContext context) {
    final filteredExpenses = widget.expenses.where((item) {
      final category = item["category"]?.toString();
      if (category != widget.node.title) {
        return false;
      }
      if (selectedPerson == null) {
        return true;
      }
      final id = (item["id"] as num?)?.toInt();
      return widget.expensePeople[id] == selectedPerson;
    }).toList();

    final total = filteredExpenses.fold<double>(0, (sum, item) {
      final amount = (item["amount"] as num?)?.toDouble() ?? 0;
      return sum + amount;
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.node.title),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<String>(
            value: selectedPerson,
            items: [
              const DropdownMenuItem<String>(
                value: null,
                child: Text('Всі'),
              ),
              ...widget.people.map(
                (person) => DropdownMenuItem(
                  value: person,
                  child: Text(person),
                ),
              ),
            ],
            onChanged: (value) {
              setState(() {
                selectedPerson = value;
              });
            },
            decoration: const InputDecoration(labelText: 'Фільтр за людьми'),
          ),
          const SizedBox(height: 16),
          for (final expense in filteredExpenses)
            ExpenseCard(
              expense: expense,
              people: widget.people,
              selectedPerson: widget.expensePeople[
                  (expense["id"] as num?)?.toInt() ?? -1],
              onPersonChanged: (person) {
                final id = (expense["id"] as num?)?.toInt();
                if (id == null) return;
                setState(() {
                  widget.expensePeople[id] = person;
                });
              },
            ),
          const SizedBox(height: 16),
          ListTile(
            title: const Text('Загальна сума:'),
            trailing: Text(total.toStringAsFixed(2)),
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade200),
            ),
          ),
        ],
      ),
    );
  }
}

class ExpenseCard extends StatelessWidget {
  const ExpenseCard({
    super.key,
    required this.expense,
    required this.people,
    required this.selectedPerson,
    required this.onPersonChanged,
  });

  final dynamic expense;
  final List<String> people;
  final String? selectedPerson;
  final ValueChanged<String> onPersonChanged;

  @override
  Widget build(BuildContext context) {
    final title = expense["title"]?.toString() ?? '';
    final amount = (expense["amount"] as num?)?.toDouble() ?? 0;
    final date = expense["date"]?.toString() ?? '';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 16)),
                DropdownButton<String>(
                  value: selectedPerson ?? people.first,
                  items: people
                      .map(
                        (person) => DropdownMenuItem(
                          value: person,
                          child: Text(person),
                        ),
                      )
                      .toList(),
                  onChanged: (value) {
                    if (value != null) {
                      onPersonChanged(value);
                    }
                  },
                  underline: const SizedBox.shrink(),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text('Короткий опис: $date'),
            const SizedBox(height: 4),
            Text(
              '-${amount.toStringAsFixed(2)} грн.',
              style: const TextStyle(color: Colors.red),
            ),
          ],
        ),
      ),
    );
  }
}

class FamilyPage extends StatelessWidget {
  const FamilyPage({super.key, required this.people, required this.onAdd});

  final List<String> people;
  final ValueChanged<String> onAdd;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Сімя'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ...people.map(
            (person) => ListTile(
              title: Text(person),
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () async {
              final controller = TextEditingController();
              await showDialog<void>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Додати учасника'),
                  content: TextField(
                    controller: controller,
                    decoration: const InputDecoration(labelText: 'Імʼя'),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Скасувати'),
                    ),
                    FilledButton(
                      onPressed: () {
                        onAdd(controller.text);
                        Navigator.of(context).pop();
                      },
                      child: const Text('Додати'),
                    ),
                  ],
                ),
              );
            },
            child: const Text('Додати учасника'),
          ),
        ],
      ),
    );
  }
}

class BalanceCircle extends StatelessWidget {
  const BalanceCircle({super.key, required this.title, required this.value});

  final String title;
  final double value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      height: 140,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title),
            Text(
              '${value.toStringAsFixed(2)} грн.',
              style: const TextStyle(fontSize: 16, color: Colors.red),
            ),
            const Text('Витрати'),
          ],
        ),
      ),
    );
  }
}

class CategoryCircle extends StatelessWidget {
  const CategoryCircle({
    super.key,
    required this.title,
    required this.color,
    required this.onTap,
  });

  final String title;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 90,
        height: 90,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white,
          border: Border.all(color: color.withOpacity(0.4)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12),
            ),
          ),
        ),
      ),
    );
  }
}
