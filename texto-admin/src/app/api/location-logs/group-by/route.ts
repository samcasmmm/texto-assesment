import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LocationLog from '@/models/LocationLog';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  await dbConnect();

  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  const match: any = {};

  // 🔥 TEMP: comment this to debug if needed
  if (!isAdmin(user)) {
    match.userId = new mongoose.Types.ObjectId(user.userId);
  }

  if (date) {
    match.date = date; // must be 'yyyy-MM-dd'
  }

  console.log('MATCH:', match);

  const result = await LocationLog.aggregate([
    { $match: match },

    // 🔥 IMPORTANT: make sure this matches your actual collection name
    {
      $lookup: {
        from: 'employees', // <-- verify with `show collections`
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },

    // 🔥 prevent crash if no user found
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔥 ensure locations exist
    {
      $addFields: {
        lastLocation: {
          $cond: [
            { $gt: [{ $size: '$locations' }, 0] },
            { $arrayElemAt: ['$locations', -1] },
            null,
          ],
        },
      },
    },

    {
      $project: {
        _id: { $ifNull: ['$user._id', '$userId'] },
        name: { $ifNull: ['$user.name', 'Unknown'] },
        role: { $ifNull: ['$user.role', 'N/A'] },

        location: {
          lat: {
            $cond: [
              '$lastLocation',
              { $arrayElemAt: ['$lastLocation.coordinates.coordinates', 1] },
              null,
            ],
          },
          lng: {
            $cond: [
              '$lastLocation',
              { $arrayElemAt: ['$lastLocation.coordinates.coordinates', 0] },
              null,
            ],
          },
        },
      },
    },
  ]);

  console.log('RESULT:', result);

  return NextResponse.json({
    success: true,
    data: result,
  });
}
