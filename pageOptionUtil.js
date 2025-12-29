/**
 * Extracts pagination, search, and sorting options from request query.
 * Applies defaults and returns a standardized format.
 */

const getPageOptions = (query = {}) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      order = "desc",
      orderBy = "createdAt",
    } = query;
  
    return {
      page: Math.max(parseInt(page), 1),
      limit: Math.min(parseInt(limit), 100), // max 100 per page
      search: search.trim(),
      order: order.toLowerCase() === "asc" ? "asc" : "desc",
      orderBy,
    };
  };
  
  module.exports = getPageOptions;
