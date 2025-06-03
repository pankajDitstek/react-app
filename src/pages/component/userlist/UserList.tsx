import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserList, createUser, updateUser, deleteUser } from "../../../service/service";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Avatar,
  Chip,
  styled,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Box,
  CircularProgress
} from "@mui/material";
import * as yup from 'yup';

interface User {
  id: number;
  avatar: string;
  name: string;
  email: string;
  password: string;
  role?: string;
}

const userSchema = yup.object().shape({
  avatar: yup.string().url('Avatar must be a valid URL').nullable(),
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  overflow: 'hidden',
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
}));

const StyledTableContainer = styled(TableContainer)({
  maxHeight: 'calc(100vh - 230px)',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#ccc',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#aaa',
  },
}) as typeof TableContainer;

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '16px',
}));

const StyledTableBodyCell = styled(TableCell)({
  fontSize: '15px',
});

const StyledAvatar = styled(Avatar)({
  width: '56px',
  height: '56px',
  border: '2px solid #e0e0e0',
});

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: '600',
  fontSize: '14px',
  padding: theme.spacing(0.5),
}));

const UserList = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const emptyUser: User = useMemo(() => ({
    id: 0,
    avatar: '',
    name: '',
    email: '',
    password: ''
  }), []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await getUserList();
      setUserList(users);
    } catch (error) {
      console.error('Error fetching user list:', error);
      showSnackbar('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreateDialog = () => {
    setCurrentUser(emptyUser);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev!,
      [name]: value
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    try {
      await userSchema.validate(currentUser, { abortEarly: false });
      setFormErrors({});

      const userData = {
        name: currentUser.name,
        email: currentUser.email,
        ...(!isEditing && { password: currentUser.password }),
        ...(currentUser.avatar && { avatar: currentUser.avatar })
      };

      if (isEditing) {
        await updateUser(currentUser.id, userData);
        showSnackbar('User updated successfully', 'success');
      } else {
        await createUser(currentUser);
        showSnackbar('User created successfully', 'success');
      }

      fetchUsers();
      handleCloseDialog();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const errors = error.inner.reduce((acc: Record<string, string>, err: yup.ValidationError) => {
          if (err.path) acc[err.path] = err.message;
          return acc;
        }, {});
        setFormErrors(errors);
        showSnackbar(error.inner[0].message, 'error');
      } else {
        console.error('Error saving user:', error);
        showSnackbar(`Failed to ${isEditing ? 'update' : 'create'} user`, 'error');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      showSnackbar('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Failed to delete user', 'error');
    }
  };

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Memoize paginated data
  const paginatedUsers = useMemo(() => {
    return userList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [userList, page, rowsPerPage]);

  return (
    <StyledPaper>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
          User List
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreateDialog}
        >
          Add User
        </Button>
      </Box>

      <StyledTableContainer>
        <Table stickyHeader aria-label="user table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>ID</StyledTableHeadCell>
              <StyledTableHeadCell>Avatar</StyledTableHeadCell>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Role</StyledTableHeadCell>
              <StyledTableHeadCell>Actions</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <StyledTableBodyCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </StyledTableBodyCell>
              </TableRow>
            ) : userList.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow hover key={user.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <StyledTableBodyCell>{user.id}</StyledTableBodyCell>
                  <StyledTableBodyCell>
                    <StyledAvatar src={user.avatar} alt={user.name} />
                  </StyledTableBodyCell>
                  <StyledTableBodyCell sx={{ fontWeight: '500' }}>{user.name}</StyledTableBodyCell>
                  <StyledTableBodyCell>{user.email}</StyledTableBodyCell>
                  <StyledTableBodyCell>
                    <StyledChip
                      label={user.role || 'user'}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </StyledTableBodyCell>
                  <StyledTableBodyCell>
                    <Button
                      color="primary"
                      onClick={() => handleOpenEditDialog(user)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </StyledTableBodyCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableBodyCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1">No users found</Typography>
                </StyledTableBodyCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={userList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* User Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
        <DialogContent>
          {currentUser && (
            <Box component="form" mt={1}>
              <TextField
                margin="normal"
                fullWidth
                label="Avatar URL"
                name="avatar"
                value={currentUser.avatar}
                onChange={handleInputChange}
                error={!!formErrors.avatar}
                helperText={formErrors.avatar}
              />
              <TextField
                margin="normal"
                fullWidth
                required
                label="Name"
                name="name"
                value={currentUser.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              <TextField
                margin="normal"
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={currentUser.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              {!isEditing && (
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Password"
                  name="password"
                  type="password"
                  value={currentUser.password}
                  onChange={handleInputChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default UserList;