import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../config.dart';
import '../models/tree_node.dart';
import '../widgets/balance_widget.dart';
import '../widgets/category_circle_widget.dart';
import 'group_screens.dart';
import 'operations_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const double baseBalance = 100.0;

  late Future<List<TreeNode>> treeFuture;
  double expensesTotal = 0;

  @override
  void initState() {
    super.initState();
    treeFuture = fetchTree();
    fetchExpenses();
  }

  Future<List<TreeNode>> fetchTree() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/tree'));
      if (response.statusCode >= 400) {
        throw Exception('Failed to load tree');
      }
      final data = jsonDecode(response.body) as List<dynamic>;
      return data
          .map((node) => TreeNode.fromJson(node as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return _fallbackTree();
    }
  }

  Future<void> fetchExpenses() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/ops?month='));
      if (response.statusCode >= 400) return;
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final total = (data['total'] as num?)?.toDouble() ?? 0;
      if (mounted) {
        setState(() {
          expensesTotal = total;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          expensesTotal = 0;
        });
      }
    }
  }

  Future<void> refreshTree() async {
    setState(() {
      treeFuture = fetchTree();
    });
    await fetchExpenses();
  }

  List<TreeNode> _fallbackTree() {
    const names = [
      'Транспорт',
      'Закупка',
      'Дім',
      'Краса',
      'Дозвілля',
      'Підписки',
      'Здоровя',
      'Сімя',
    ];
    return names.map((name) => TreeNode(name: name, children: [])).toList();
  }

  Color colorForGroup(String name) {
    const palette = [
      Color(0xFF7A8CFF),
      Color(0xFF8CD790),
      Color(0xFFF2C57C),
      Color(0xFFF28BA8),
      Color(0xFFA5C8FF),
      Color(0xFFD2A6FF),
      Color(0xFF7CDDDD),
      Color(0xFFB0B0B0),
    ];
    return palette[name.hashCode.abs() % palette.length];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Головна'),
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {},
        ),
      ),
      body: RefreshIndicator(
        onRefresh: refreshTree,
        child: FutureBuilder<List<TreeNode>>(
          future: treeFuture,
          builder: (context, snapshot) {
            final tree = snapshot.data ?? [];
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  DateFormat('MMMM yyyy', 'uk').format(DateTime.now()),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 16),
                Center(
                  child: BalanceWidget(
                    balance: baseBalance,
                    expenses: expensesTotal,
                  ),
                ),
                const SizedBox(height: 24),
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  alignment: WrapAlignment.center,
                  children: [
                    ...tree.map(
                      (node) => CategoryCircleWidget(
                        title: node.name,
                        color: colorForGroup(node.name),
                        onTap: () async {
                          if (node.children.isEmpty) {
                            await Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => OperationsScreen(
                                  groupName: node.name,
                                  groupPath: [node.name],
                                ),
                              ),
                            );
                          } else {
                            await Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => GroupScreen(
                                  title: node.name,
                                  path: [node.name],
                                  node: node,
                                ),
                              ),
                            );
                          }
                          await refreshTree();
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Center(
                  child: OutlinedButton(
                    onPressed: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const GroupEditScreen(
                            parentPath: [],
                            parentName: 'Головна',
                          ),
                        ),
                      );
                      await refreshTree();
                    },
                    child: const Text('Додати категорію'),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
