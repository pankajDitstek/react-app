import { useState, useEffect } from "react";
import { 
  addcategoies, 
  categories, 
  deletecategories, 
  updatecategoies 
} from "../../../service/service";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  IconButton,
  CircularProgress,
  Box,
  Typography,
  TablePagination,
  Alert
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import * as yup from 'yup';

interface Category {
  id: number;
  name: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}

const categorySchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  image: yup.string().url('Image must be a valid URL').required('Image is required'),
});

const Categories = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 5
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categories();
      setCategoryList(data);
    } catch (error) {
      showSnackbar('Failed to fetch categories', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (category: Partial<Category> | null, editing: boolean) => {
    setCurrentCategory(category || { 
      name: '', 
      image: '' 
    });
    setIsEditing(editing);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: value
    }));
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSaveCategory = async () => {
    setFormErrors({});
    try {
      await categorySchema.validate(currentCategory, { abortEarly: false });
      if (isEditing && currentCategory?.id) {
        await updatecategoies(currentCategory.id, {
          name: currentCategory.name,
          image: currentCategory.image
        });
        showSnackbar('Category updated successfully', 'success');
      } else {
        await addcategoies({
          name: currentCategory?.name || '',
          image: currentCategory?.image || ''
        });
        showSnackbar('Category added successfully', 'success');
      }
      fetchCategories();
      handleCloseDialog();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err: any) => {
          if (err.path) errors[err.path] = err.message;
        });
        setFormErrors(errors);
      } else {
        showSnackbar('Failed to save category', 'error');
        console.error('Error:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deletecategories(id);
      showSnackbar('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error) {
      showSnackbar('Failed to delete category', 'error');
      console.error('Error:', error);
    }
  };

  const handlePaginationChange = (event: any, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({
      page: 0,
      rowsPerPage: parseInt(e.target.value, 10)
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Box sx={{ p: 0 ,mt:5}}>
     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
        Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog(null, false)}
        >
          Add Category
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
            <Table >
              <TableHead  sx={{ backgroundColor: '#1976d2' , fontWeight: 'bold',  fontSize: '16px',}}>
                <TableRow >
                  <TableCell  sx={{ fontWeight: 'bold',  fontSize: '16px',color:'white'}}>ID</TableCell>
                  <TableCell  sx={{ fontWeight: 'bold',  fontSize: '16px',color:'white'}}>Name</TableCell>
                  <TableCell  sx={{ fontWeight: 'bold',  fontSize: '16px',color:'white'}}>Image</TableCell>
                  <TableCell  sx={{ fontWeight: 'bold',  fontSize: '16px',color:'white'}}>Created At</TableCell>
                  <TableCell  sx={{ fontWeight: 'bold',  fontSize: '16px',color:'white'}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryList.length > 0 ? (
                  categoryList
                    .slice(
                      pagination.page * pagination.rowsPerPage,
                      pagination.page * pagination.rowsPerPage + pagination.rowsPerPage
                    )
                    .map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            style={{ width: 50, height: 50, objectFit: 'cover' }} 
                          />
                        </TableCell>
                        <TableCell>{new Date(category.creationAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(category, true)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={categoryList.length}
            rowsPerPage={pagination.rowsPerPage}
            page={pagination.page}
            onPageChange={handlePaginationChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <TextField
              name="name"
              label="Name"
              value={currentCategory?.name || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              name="image"
              label="Image URL"
              value={currentCategory?.image || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!formErrors.image}
              helperText={formErrors.image}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Categories;