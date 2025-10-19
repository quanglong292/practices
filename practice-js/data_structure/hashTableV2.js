class HashTable {
  constructor(size) {
    this.size = size;
    this.buckets = new Array(size);
  }

  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash += key.charCodeAt(i);
    }
    return hash % this.size;
  }

  insert(key, value) {
    const index = this.hash(key);
    if (!this.buckets[index]) {
      this.buckets[index] = [];
    }
    this.buckets[index].push({ key, value });
  }

  get(key) {
    const index = this.hash(key);
    if (!this.buckets[index]) {
      return null;
    }
    for (let i = 0; i < this.buckets[index].length; i++) {
      if (this.buckets[index][i].key === key) {
        return this.buckets[index][i].value;
      }
    }
    return null;
  }

  remove(key) {
    const index = this.hash(key);
    if (!this.buckets[index]) {
      return null;
    }
    for (let i = 0; i < this.buckets[index].length; i++) {
      if (this.buckets[index][i].key === key) {
        const removedValue = this.buckets[index][i].value;
        this.buckets[index].splice(i, 1);
        return removedValue;
      }
    }
    return null;
  }
}

// Example usage:
const myHashTable = new HashTable(10);
myHashTable.insert("name", "John");
myHashTable.insert("age", 25);
console.log(myHashTable.get("name")); // Output: John
console.log(myHashTable.get("age")); // Output: 25
myHashTable.remove("age");
console.log(myHashTable.get("age")); // Output: null

// Example usage of Map in JavaScript

// Create a new Map
const myMap = new Map();

// Add key-value pairs to the Map
myMap.set("name", "John");
myMap.set("age", 25);
myMap.set("city", "New York");

// Get values from the Map
console.log(myMap.get("name")); // Output: John
console.log(myMap.get("age")); // Output: 25
console.log(myMap.get("city")); // Output: New York

// Check if a key exists in the Map
console.log(myMap.has("name")); // Output: true
console.log(myMap.has("gender")); // Output: false

// Remove a key-value pair from the Map
myMap.delete("age");

// Get the size of the Map
console.log(myMap.size); // Output: 2

// Iterate over the Map
for (const [key, value] of myMap) {
  console.log(`${key}: ${value}`);
}
