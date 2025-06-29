function toCamelCase(str: string) {
  return str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
}

function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

const filterKeys = [
  "user_id",
  "price_from",
  "price_to",
  "year_from",
  "year_to",
  "make_id",
  "model_id",
  "category_id",
  "miles_from",
  "miles_to",
  "fuel_type",
  "transmission",
  "car_engine_capacities",
  "cylinder_count",
  "condition",
  "location",
  "color",
  "interior_color",
  "tinted",
  "status",
  "is_featured",
  "is_imported",
  "is_inspected",
  "owner_type",
  "has_warranty",
  "has_insurance",
  "is_business",
  "updated_from",
  "updated_to",
  "is_active",
];


export function extractFiltersFromQuery(query: any) {
  const filters: Record<string, any> = {};

  for (const key of filterKeys) {
    const camelKey = toCamelCase(key); // e.g., 'userId' for 'user_id'
    const snakeKey = toSnakeCase(key); // e.g., 'user_id'

    const value = query[camelKey] ?? query[snakeKey];
    if (value !== undefined && value !== "all") {
      // Convert booleans correctly
      if (["is_featured", "is_active", "is_imported", "is_inspected", "is_business", "has_warranty", "has_insurance"].includes(key)) {
        filters[key] = value === "true";
      }
      // Convert numeric filters safely
      else if (["make_id", "model_id", "category_id", "year_from", "year_to", "price_from", "price_to", "miles_from", "miles_to", "cylinder_count"].includes(key)) {
        const num = Number(value);
        if (!isNaN(num)) {
          filters[key] = num;
        }
      }
      // Otherwise, keep as string
      else {
        filters[key] = value;
      }
    }
  }

  return filters;
}
