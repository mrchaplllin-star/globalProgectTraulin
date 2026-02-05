class OpsEntry {
  OpsEntry({
    required this.amount,
    required this.type,
    required this.groupPath,
  });

  final double amount;
  final String type;
  final List<String> groupPath;

  factory OpsEntry.fromJson(Map<String, dynamic> json) {
    final rawPath = json['groupPath'] ?? json['path'];
    final path = rawPath is List
        ? rawPath.map((part) => part.toString()).toList()
        : rawPath is String
            ? rawPath
                .split('/')
                .map((part) => part.trim())
                .where((part) => part.isNotEmpty)
                .toList()
            : <String>[];
    return OpsEntry(
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      type: json['type']?.toString() ?? 'expense',
      groupPath: path,
    );
  }
}

class OpsTotals {
  const OpsTotals({required this.balance, required this.expenses});

  final double balance;
  final double expenses;
}

List<String> normalizePath(List<String> path) {
  if (path.isNotEmpty && path.first == 'Головна') {
    return path.sublist(1);
  }
  return path;
}

bool pathMatches(List<String> opPath, List<String> prefix) {
  final normalizedOpPath = normalizePath(opPath);
  final normalizedPrefix = normalizePath(prefix);
  if (normalizedPrefix.isEmpty) return true;
  if (normalizedOpPath.length < normalizedPrefix.length) return false;
  for (var i = 0; i < normalizedPrefix.length; i++) {
    if (normalizedOpPath[i] != normalizedPrefix[i]) return false;
  }
  return true;
}

OpsTotals calculateTotals(List<OpsEntry> entries, List<String> prefix) {
  double balance = 0;
  double expenses = 0;
  for (final entry in entries) {
    if (!pathMatches(entry.groupPath, prefix)) continue;
    if (entry.type == 'income') {
      balance += entry.amount;
    } else {
      balance -= entry.amount;
      expenses += entry.amount;
    }
  }
  return OpsTotals(balance: balance, expenses: expenses);
}
