import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardImg,
  CardText,
  Col,
  Container,
  Form,
  Pagination,
  Row,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/Slices/cartSlice";
import {
  FiSearch,
  FiShoppingCart,
  FiEye,
  FiStar,
  FiFilter,
  FiRotateCcw,
} from "react-icons/fi";

export default function Products() {
  const dispatch = useDispatch();

  // All products
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Search input & sorting
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [skip, setSkip] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8;

  // Fetch categories list on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("https://dummyjson.com/products/categories");
        // DummyJSON categories can be objects { slug, name, url } or strings
        const formatted = response.data.map((cat) =>
          typeof cat === "object" ? { slug: cat.slug, name: cat.name } : { slug: cat, name: cat }
        );
        setCategories(formatted);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Update pagination
  function updatePagination(page) {
    setCurrentPage(page);
    setSkip((page - 1) * limit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Handle search input change
  function handleSearchChange(e) {
    setSearchValue(e.target.value);
    setSelectedCategory("all");
    setCurrentPage(1);
    setSkip(0);
  }

  // Handle category change
  function handleCategoryChange(e) {
    const cat = e.target.value;
    setSelectedCategory(cat);
    setSearchValue("");
    setCurrentPage(1);
    setSkip(0);
  }

  // Reset all filters
  function resetFilters() {
    setSearchValue("");
    setSelectedCategory("all");
    setSortBy("default");
    setCurrentPage(1);
    setSkip(0);
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let url = "";

        if (searchValue.trim()) {
          url = `https://dummyjson.com/products/search?q=${encodeURIComponent(
            searchValue.trim()
          )}&limit=${limit}&skip=${skip}`;
        } else if (selectedCategory && selectedCategory !== "all") {
          url = `https://dummyjson.com/products/category/${encodeURIComponent(
            selectedCategory
          )}?limit=${limit}&skip=${skip}`;
        } else {
          url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
        }

        const response = await axios.get(url);
        let items = response.data.products || [];

        // Apply client-side sorting if needed
        if (sortBy === "price-low") {
          items = [...items].sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
          items = [...items].sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
          items = [...items].sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "title") {
          items = [...items].sort((a, b) => a.title.localeCompare(b.title));
        }

        setProducts(items);
        const total = response.data.total || 0;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / limit));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchValue, selectedCategory, skip, sortBy]);

  return (
    <Container className="py-4">
      {/* Header and Filter Control Bar */}
      <div className="bg-body-tertiary p-4 rounded-4 shadow-sm mb-4 border">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h2 className="fw-bold mb-1">Explore Products</h2>
            <p className="text-muted mb-0">
              Showing {totalCount} {totalCount === 1 ? "product" : "products"} available
            </p>
          </div>
          {(searchValue || selectedCategory !== "all" || sortBy !== "default") && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={resetFilters}
              className="d-flex align-items-center gap-1 rounded-pill"
            >
              <FiRotateCcw size={14} /> Reset Filters
            </Button>
          )}
        </div>

        <Row className="g-3">
          {/* Search Box */}
          <Col md={5}>
            <div className="position-relative">
              <Form.Control
                type="search"
                placeholder="Search products by title, keyword..."
                value={searchValue}
                onChange={handleSearchChange}
                className="ps-4 rounded-pill py-2"
              />
            </div>
          </Col>

          {/* Category Dropdown */}
          <Col md={4} sm={6}>
            <Form.Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="rounded-pill py-2"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Col>

          {/* Sort Dropdown */}
          <Col md={3} sm={6}>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-pill py-2"
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant="primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading products...</span>
          </Spinner>
          <p className="mt-3 text-muted">Finding the best products for you...</p>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="text-center my-5 py-5 border rounded-4 bg-body-tertiary">
          <h4 className="fw-bold mb-2">No Products Found</h4>
          <p className="text-muted mb-4">
            Try adjusting your search criteria or choosing a different category.
          </p>
          <Button variant="dark" className="rounded-pill px-4" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        /* Products Grid */
        <Row className="g-4">
          {products.map((product) => (
            <Col key={product.id} sm={6} md={4} lg={3}>
              <Card className="shadow-sm h-100 border-0 rounded-4 overflow-hidden product-card d-flex flex-column">
                <div
                  className="position-relative bg-body-tertiary d-flex align-items-center justify-content-center p-3"
                  style={{ height: "220px", overflow: "hidden" }}
                >
                  <CardImg
                    src={product.thumbnail}
                    variant="top"
                    alt={product.title}
                    style={{
                      maxHeight: "180px",
                      objectFit: "contain",
                      transition: "transform 0.3s ease",
                    }}
                    className="product-img"
                  />
                  {product.discountPercentage && (
                    <Badge
                      bg="danger"
                      className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-pill"
                    >
                      -{Math.round(product.discountPercentage)}%
                    </Badge>
                  )}
                  {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                    <Badge
                      bg="warning"
                      text="dark"
                      className="position-absolute top-0 end-0 m-3 px-2 py-1 rounded-pill"
                    >
                      Low Stock
                    </Badge>
                  )}
                </div>

                <CardBody className="d-flex flex-column p-3 flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted text-capitalize small">
                      {product.category}
                    </span>
                    <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                      <FiStar size={12} /> {product.rating}
                    </span>
                  </div>

                  <Card.Title className="fs-6 fw-bold text-truncate mb-1" title={product.title}>
                    {product.title}
                  </Card.Title>

                  <CardText
                    className="text-muted small flex-grow-1 mb-3"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {product.description}
                  </CardText>

                  <div className="d-flex align-items-baseline gap-2 mt-auto mb-2">
                    <span className="fs-5 fw-bold text-success">${product.price}</span>
                    {product.discountPercentage && (
                      <span className="text-muted small text-decoration-line-through">
                        ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardBody>

                <CardFooter className="bg-transparent border-0 pt-0 pb-3 px-3 d-flex gap-2">
                  <Button
                    as={Link}
                    variant="outline-secondary"
                    size="sm"
                    to={`/product-details/${product.id}`}
                    className="flex-fill d-flex align-items-center justify-content-center gap-1 rounded-pill"
                  >
                    <FiEye size={15} /> Details
                  </Button>
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => dispatch(addToCart(product))}
                    className="flex-fill d-flex align-items-center justify-content-center gap-1 rounded-pill"
                  >
                    <FiShoppingCart size={15} /> Add
                  </Button>
                </CardFooter>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <Pagination className="d-flex flex-wrap justify-content-center my-4">
          <Pagination.First
            onClick={() => updatePagination(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => updatePagination(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            // Only show nearby pages if there are many pages
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
            ) {
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => updatePagination(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            }
            if (
              (pageNum === currentPage - 3 && pageNum > 1) ||
              (pageNum === currentPage + 3 && pageNum < totalPages)
            ) {
              return <Pagination.Ellipsis key={`ellipsis-${pageNum}`} disabled />;
            }
            return null;
          })}
          <Pagination.Next
            onClick={() => updatePagination(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => updatePagination(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </Container>
  );
}
