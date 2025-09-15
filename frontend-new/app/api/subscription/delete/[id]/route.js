import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const db = await getDatabase();
    const subscriptionsCollection = db.collection('subscriptions');

    // Find the subscription by studentEmail (since that's what we're using as ID in the frontend)
    const subscription = await subscriptionsCollection.findOne({ studentEmail: id });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Delete the subscription
    const result = await subscriptionsCollection.deleteOne({ studentEmail: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete subscription' },
        { status: 500 }
      );
    }

    console.log(`Deleted subscription for student: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully'
    });

  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
