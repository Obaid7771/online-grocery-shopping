class ProductImageModel {
  final String id;
  final String url;
  final bool isPrimary;
  final int sortOrder;

  ProductImageModel({
    required this.id,
    required this.url,
    required this.isPrimary,
    required this.sortOrder,
  });

  factory ProductImageModel.fromJson(Map<String, dynamic> json) {
    return ProductImageModel(
      id: json['id'] as String? ?? '',
      url: json['url'] as String? ?? '',
      isPrimary: json['isPrimary'] as bool? ?? false,
      sortOrder: json['sortOrder'] as int? ?? 0,
    );
  }
}

class ProductModel {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String sku;
  final double price;
  final double? discountPrice;
  final String unit;
  final double unitStep;
  final int stockQuantity;
  final int minStockThreshold;
  final bool isFeatured;
  final List<ProductImageModel> images;
  final String? categoryName;
  final double averageRating;

  ProductModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.sku,
    required this.price,
    this.discountPrice,
    required this.unit,
    required this.unitStep,
    required this.stockQuantity,
    required this.minStockThreshold,
    required this.isFeatured,
    this.images = const [],
    this.categoryName,
    this.averageRating = 5.0,
  });

  double get effectivePrice => discountPrice ?? price;
  bool get hasDiscount => discountPrice != null && discountPrice! < price;
  bool get isInStock => stockQuantity > 0;

  int get discountPercentage {
    if (!hasDiscount) return 0;
    return (((price - discountPrice!) / price) * 100).round();
  }

  String get primaryImageUrl {
    if (images.isEmpty) {
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    }
    final primary = images.firstWhere(
      (img) => img.isPrimary,
      orElse: () => images.first,
    );
    return primary.url;
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Product',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String?,
      sku: json['sku'] as String? ?? '',
      price: (num.parse(json['price'].toString())).toDouble(),
      discountPrice: json['discountPrice'] != null
          ? (num.parse(json['discountPrice'].toString())).toDouble()
          : null,
      unit: json['unit'] as String? ?? 'PIECE',
      unitStep: json['unitStep'] != null
          ? (num.parse(json['unitStep'].toString())).toDouble()
          : 1.0,
      stockQuantity: json['stockQuantity'] as int? ?? 0,
      minStockThreshold: json['minStockThreshold'] as int? ?? 5,
      isFeatured: json['isFeatured'] as bool? ?? false,
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => ProductImageModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      categoryName: json['category'] != null ? json['category']['name'] as String? : null,
      averageRating: json['averageRating'] != null
          ? (num.parse(json['averageRating'].toString())).toDouble()
          : 5.0,
    );
  }
}
