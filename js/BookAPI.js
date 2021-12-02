class BookAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getBooks() {
    try {
      const res = await fetch(`${this.baseURL}/api/book/all`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.msg);
      }

      return data;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async addBook(body) {
    try {
      const res = await fetch(`${this.baseURL}/api/book`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.msg);
      }

      return data;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updateBook(bookId, body) {
    try {
      const res = await fetch(`${this.baseURL}/api/book/${bookId}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.msg);
      }

      return data;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async deleteBook(bookId) {
    try {
      const res = await fetch(`${this.baseURL}/api/book/${bookId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.msg);
      }

      return data;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
