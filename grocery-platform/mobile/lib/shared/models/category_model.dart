class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? imageUrl;
  final int sortOrder;
  final List<CategoryModel> children;
  final int? productCount;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.imageUrl,
    required this.sortOrder,
    this.children = const [],
    this.productCount,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      sortOrder: json['sortOrder'] as int? ?? 0,
      children: (json['children'] as List<dynamic>?)
              ?.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      productCount: json['_count'] != null
          ? (json['_count']['products'] as int?)
          : null,
    );
  }
}
