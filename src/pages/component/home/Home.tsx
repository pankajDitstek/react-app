import { useEffect, useState } from "react";
import { getproducts, addProduct, updateProduct, deleteProduct, categories as fetchCategories } from "../../../service/service";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Snackbar,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  category: any;
  images: string[];
}

// Yup schema for product validation
const productSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be greater than zero')
    .required('Price is required'),
  categoryId: yup
    .number()
    .typeError('Category ID must be a number')
    .positive('Category ID must be greater than zero')
    .integer('Category ID must be an integer')
    .required('Category ID is required'),
  images: yup
    .array()
    .of(yup.string().url('Image must be a valid URL'))
    .min(1, 'At least one image URL is required'),
});

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [productlists, setProductList] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<{ id: number, name: string }[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const { control, handleSubmit: formSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      categoryId: 0,
      images: ['https://placehold.co/600x400'],
    },
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const products = await getproducts();
        setProductList(products);
        // Fetch categories for dropdown
        const cats = await fetchCategories();
        setCategoryList(cats);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Failed to fetch data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = () => {
    reset({
      title: '',
      description: '',
      price: 0,
      categoryId: 0,
      images: ['https://placehold.co/600x400'],
    });
    setCurrentProduct({
      id: 0,
      title: '',
      description: '',
      price: 0,
      categoryId: 0,
      category: '',
      images: ['https://placehold.co/600x400']
    });
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const handleEditProduct = (product: Product) => {
   
    reset({
      title: product.title,
      price: product.price,
      description: product.description,
      categoryId: product.category.id,
      images: product.images,
    });
    setCurrentProduct(product);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteProduct = async (id: number) => {
    try {

      await deleteProduct(id);
      showSnackbar('Product deleted successfully', 'success');
      getProductLists();
    } catch (error) {
      console.error('Error deleting product:', error);
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const getProductLists = async () => {
    try {
      setLoading(true);
      const products = await getproducts();
      setProductList(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update handleSubmit to use react-hook-form
  const onSubmit = async (data: any) => {
    try {
      debugger
      if (isEditMode && currentProduct) {
        await updateProduct(currentProduct.id, data);
        showSnackbar('Product updated successfully', 'success');
      } else {
        await addProduct(data);
        showSnackbar('Product added successfully', 'success');
      }
      setOpenDialog(false);
      getProductLists();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar(`Failed to ${isEditMode ? 'update' : 'add'} product`, 'error');
    }
  };

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (key: keyof Product) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortedProducts = () => {
    debugger
    if (!sortConfig.key) return productlists;
    const sorted = [...productlists].sort((a, b) => {
      let aValue = a[sortConfig.key!];
      let bValue = b[sortConfig.key!];
      // Special handling for category name
      if (sortConfig.key === 'category') {
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    return sorted;
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - productlists.length) : 0;

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {/* <h3>Product Management</h3> */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: '600',
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '1.125rem'
          }}
        >
          Product Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <p>Loading...</p>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white', cursor: 'pointer' }} onClick={() => handleSort('id')}>
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white', cursor: 'pointer' }} onClick={() => handleSort('title')}>
                    Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white', cursor: 'pointer' }} onClick={() => handleSort('description')}>
                    Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white', cursor: 'pointer' }} align="right" onClick={() => handleSort('price')}>
                    Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white', cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSortedProducts()
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow
                      key={product.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {product.id}
                      </TableCell>
                      <TableCell>
                        <img
                          src={product.images?.[0] || 'https://placehold.co/600x400'}
                          alt={product.title}
                          style={{ width: 50, height: 50, objectFit: 'cover' }}
                        />
                      </TableCell>
                      <TableCell>{product.title}</TableCell>
                      <TableCell>
                        {product.description.length > 50
                          ? `${product.description.substring(0, 50)}...`
                          : product.description}
                      </TableCell>
                      <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.category.name}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={productlists.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{isEditMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <form onSubmit={formSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  margin="dense"
                  label="Title"
                  type="text"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Price"
                  type="number"
                  fullWidth
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              )}
            />
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="dense" error={!!errors.categoryId}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    {...field}
                    labelId="category-label"
                    label="Category"
                    value={field.value || ''}
                    onChange={field.onChange}
                  >
                    {categoryList.map((category) => (
                      <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginLeft: '14px', marginTop: '3px' }}>{errors.categoryId.message}</span>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="images.0"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  label="Image URL"
                  type="text"
                  fullWidth
                  error={!!errors.images}
                  helperText={errors.images?.[0]?.message || errors.images?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" color="primary">
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;