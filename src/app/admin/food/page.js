'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/helpers';

export default function AdminFood() {
  const [food, setFood] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: 0,
    image: '',
    description: '',
    is_available: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [foodRes, categoriesRes] = await Promise.all([
        fetch('/api/food'),
        fetch('/api/categories'),
      ]);

      const foodData = await foodRes.json();
      const categoriesData = await categoriesRes.json();

      if (foodData.success) {
        setFood(foodData.data);
      }
      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (foodItem = null) => {
    if (foodItem) {
      setEditingFood(foodItem);
      setFormData({
        name: foodItem.name || '',
        category_id: foodItem.category_id || '',
        price: foodItem.price || 0,
        image: foodItem.image || '',
        description: foodItem.description || '',
        is_available: foodItem.is_available !== undefined ? foodItem.is_available : true,
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        price: 0,
        image: '',
        description: '',
        is_available: true,
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFood(null);
    setFormData({
      name: '',
      category_id: '',
      price: 0,
      image: '',
      description: '',
      is_available: true,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Tên món là bắt buộc');
      return;
    }

    if (!formData.category_id) {
      setError('Danh mục là bắt buộc');
      return;
    }

    if (!formData.price || formData.price < 0) {
      setError('Giá phải lớn hơn 0');
      return;
    }

    try {
      const url = editingFood
        ? `/api/food/${editingFood.id}`
        : '/api/food';
      const method = editingFood ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(editingFood ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        fetchData();
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving food:', error);
      setError('Lỗi khi lưu món ăn');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      return;
    }

    try {
      const res = await fetch(`/api/food/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Xóa thành công!');
        fetchData();
      } else {
        setError(data.error || 'Không thể xóa món ăn');
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      setError('Lỗi khi xóa món ăn');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-card-foreground">Quản lý Món ăn</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium"
        >
          + Thêm món ăn
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-success/10 border border-success/50 text-success px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tên món
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {food.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                    Chưa có món ăn nào
                  </td>
                </tr>
              ) : (
                food.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {getCategoryName(item.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.is_available
                            ? 'bg-success/20 text-success'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {item.is_available ? 'Có sẵn' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-primary hover:text-primary-light mr-4"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full p-6 border border-border max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-card-foreground mb-6">
              {editingFood ? 'Sửa món ăn' : 'Thêm món ăn mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tên món <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Danh mục <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Giá (VNĐ) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows="3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring"
                />
                <label htmlFor="is_available" className="ml-2 text-sm text-card-foreground">
                  Món đang có sẵn
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg transition-colors font-medium"
                >
                  {editingFood ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

