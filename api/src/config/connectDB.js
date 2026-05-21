import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/databaseName');
        console.log('Connect success');
    } catch (error) {
        console.log('Connect fail');
    }
};

export default connectDB;
