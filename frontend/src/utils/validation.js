export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return null;
};

export const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters long';
    if (name.length > 50) return 'Name must be less than 50 characters';
    return null;
};

export const validateTaskTitle = (title) => {
    if (!title) return 'Title is required';
    if (title.length > 100) return 'Title must be less than 100 characters';
    return null;
};

export const validateTaskDescription = (description) => {
    if (description && description.length > 500) {
        return 'Description must be less than 500 characters';
    }
    return null;
};

export const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return 'Date of Birth is required';

    const dob = new Date(dateOfBirth);
    const minAgeDate = new Date();

    return null;
};