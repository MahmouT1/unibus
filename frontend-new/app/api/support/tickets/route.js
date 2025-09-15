import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb.js';
import SupportTicket from '@/lib/SupportTicket.js';

// GET - Retrieve all tickets (for admin) or tickets for specific user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const adminView = searchParams.get('admin') === 'true';

    // Connect to MongoDB
    await connectDB();

    let query = {};
    if (!adminView && userEmail) {
      query.email = userEmail.toLowerCase();
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch tickets', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Create new support ticket
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, category, priority, subject, description } = body;

    if (!email || !category || !priority || !subject || !description) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Connect to MongoDB
    await connectDB();
    
    const newTicket = new SupportTicket({
      email: email.toLowerCase(),
      category,
      priority,
      subject,
      description,
      status: 'open',
      adminNotes: '',
      assignedTo: '',
      resolution: ''
    });

    await newTicket.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Support ticket created successfully', 
      ticket: newTicket 
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create support ticket', 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT - Update ticket status, admin notes, or assignment
export async function PUT(request) {
  try {
    const body = await request.json();
    const { ticketId, status, adminNotes, assignedTo, resolution } = body;

    if (!ticketId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ticket ID is required' 
      }, { status: 400 });
    }

    // Connect to MongoDB
    await connectDB();

    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (resolution !== undefined) updateData.resolution = resolution;

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      updateData,
      { new: true }
    );

    if (!updatedTicket) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ticket not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ticket updated successfully', 
      ticket: updatedTicket 
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update ticket', 
      error: error.message 
    }, { status: 500 });
  }
}
