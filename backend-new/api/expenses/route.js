import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import Expense from '../../../lib/Expense.js';

// GET - Retrieve expenses with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
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
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }

    // Fetch expenses
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(limit);

    // Calculate total amount
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return NextResponse.json({
      success: true,
      expenses,
      totalAmount,
      count: expenses.length
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expenses', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new expense
export async function POST(request) {
  try {
    const body = await request.json();
    const { date, type, description, amount, category, notes, createdBy } = body;

    if (!date || !type || !description || !amount || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    const expense = new Expense({
      date: new Date(date),
      type,
      description,
      amount: parseFloat(amount),
      category: category || 'operational',
      notes,
      createdBy
    });

    await expense.save();

    return NextResponse.json({
      success: true,
      message: 'Expense created successfully',
      expense
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create expense', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update expense
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, date, type, description, amount, category, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Expense ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    const updateData = {};
    if (date) updateData.date = new Date(date);
    if (type) updateData.type = type;
    if (description) updateData.description = description;
    if (amount) updateData.amount = parseFloat(amount);
    if (category) updateData.category = category;
    if (notes !== undefined) updateData.notes = notes;

    const expense = await Expense.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!expense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update expense', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Expense ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete expense', error: error.message },
      { status: 500 }
    );
  }
}
