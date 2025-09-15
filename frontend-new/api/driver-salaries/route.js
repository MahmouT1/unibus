import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import DriverSalary from '../../../lib/DriverSalary.js';

// GET - Retrieve driver salaries with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const driverName = searchParams.get('driverName');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 100;

    // Connect to MongoDB
    await connectDB();

    // Build query
    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    if (driverName) {
      query.driverName = { $regex: driverName, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }

    // Fetch driver salaries
    const salaries = await DriverSalary.find(query)
      .sort({ date: -1 })
      .limit(limit);

    // Calculate total amount
    const totalAmount = salaries.reduce((sum, salary) => sum + salary.amount, 0);

    return NextResponse.json({
      success: true,
      salaries,
      totalAmount,
      count: salaries.length
    });

  } catch (error) {
    console.error('Error fetching driver salaries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch driver salaries', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new driver salary
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      date, 
      driverName, 
      amount, 
      hoursWorked, 
      ratePerHour, 
      paymentMethod, 
      status, 
      notes, 
      createdBy 
    } = body;

    if (!date || !driverName || !amount || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    const salary = new DriverSalary({
      date: new Date(date),
      driverName,
      amount: parseFloat(amount),
      hoursWorked: hoursWorked ? parseFloat(hoursWorked) : 0,
      ratePerHour: ratePerHour ? parseFloat(ratePerHour) : 0,
      paymentMethod: paymentMethod || 'bank_transfer',
      status: status || 'paid',
      notes,
      createdBy
    });

    await salary.save();

    return NextResponse.json({
      success: true,
      message: 'Driver salary created successfully',
      salary
    });

  } catch (error) {
    console.error('Error creating driver salary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create driver salary', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update driver salary
export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id, 
      date, 
      driverName, 
      amount, 
      hoursWorked, 
      ratePerHour, 
      paymentMethod, 
      status, 
      notes 
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Salary ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    const updateData = {};
    if (date) updateData.date = new Date(date);
    if (driverName) updateData.driverName = driverName;
    if (amount) updateData.amount = parseFloat(amount);
    if (hoursWorked !== undefined) updateData.hoursWorked = parseFloat(hoursWorked);
    if (ratePerHour !== undefined) updateData.ratePerHour = parseFloat(ratePerHour);
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const salary = await DriverSalary.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!salary) {
      return NextResponse.json(
        { success: false, message: 'Driver salary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Driver salary updated successfully',
      salary
    });

  } catch (error) {
    console.error('Error updating driver salary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update driver salary', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete driver salary
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Salary ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    const salary = await DriverSalary.findByIdAndDelete(id);

    if (!salary) {
      return NextResponse.json(
        { success: false, message: 'Driver salary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Driver salary deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting driver salary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete driver salary', error: error.message },
      { status: 500 }
    );
  }
}
