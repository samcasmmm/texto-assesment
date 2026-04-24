import mongoose from 'mongoose';
import Employee from '../src/models/Employee';
import Attendance from '../src/models/Attendance';
import GeoFence from '../src/models/GeoFence';
import LocationLog from '../src/models/LocationLog';
import * as dotenv from 'dotenv';
import path from 'path';
import { format, setHours, setMinutes } from 'date-fns';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI!;

// helpers
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const jitter = () => (Math.random() - 0.5) * 0.0015; // ~100m

// 👥 Employees
function generateEmployees() {
  const firstNames = [
    'Amit',
    'Rahul',
    'Sneha',
    'Pooja',
    'Vikas',
    'Anjali',
    'Rohit',
    'Neha',
    'Karan',
    'Priya',
    'Arjun',
    'Meera',
    'Sahil',
    'Ritika',
    'Manoj',
    'Kavya',
    'Nikhil',
    'Swati',
    'Yash',
    'Tanvi',
    'Farhan',
    'Ayesha',
    'Imran',
    'Zoya',
    'Aditya',
    'Shruti',
    'Deepak',
    'Komal',
    'Harsh',
    'Payal',
    'Wasim',
    'Sana',
    'Jatin',
    'Rekha',
    'Lokesh',
    'Divya',
    'Pratik',
    'Mansi',
    'Umesh',
  ];

  const lastNames = [
    'Sharma',
    'Verma',
    'Patil',
    'Khan',
    'Shaikh',
    'Gupta',
    'Yadav',
    'More',
    'Pawar',
    'Naik',
    'Joshi',
    'Kulkarni',
    'Singh',
    'Chavan',
    'Sawant',
    'Shinde',
    'Deshmukh',
    'Jadhav',
    'Ansari',
    'Sha',
  ];

  const roles = [
    'Developer',
    'Backend',
    'Frontend',
    'QA',
    'DevOps',
    'Designer',
    'Manager',
    'Analyst',
  ];

  return firstNames.map((f, i) => ({
    name: `${f} ${lastNames[i % lastNames.length]}`,
    email: `${f.toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@texto.in`,
    role: roles[i % roles.length],
    password: 'passwd',
  }));
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('🧹 Cleaning database...');
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await GeoFence.deleteMany({});
    await LocationLog.deleteMany({});

    // 👑 Admin
    await Employee.create({
      name: 'Admin Texto',
      email: 'admin@texto.in',
      role: 'Admin',
      password: 'passwd',
    });

    // 👥 Employees
    const employees = await Employee.insertMany(generateEmployees());

    // 📍 GeoFences
    const fences = await GeoFence.insertMany([
      {
        name: 'Thane Office',
        latitude: 19.1870534,
        longitude: 72.9779368,
        radius: 250,
      },
      {
        name: 'Koparkairane Office',
        latitude: 19.0947408,
        longitude: 73.0188197,
        radius: 250,
      },
      {
        name: 'Kalyan Office',
        latitude: 19.2358765,
        longitude: 73.1290325,
        radius: 250,
      },
    ]);

    // 📅 Date Range
    const start = new Date(2026, 3, 20);
    const end = new Date(2026, 3, 24);

    console.log('📅 Generating attendance & location logs...');

    for (const emp of employees) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        const fence = fences[Math.floor(Math.random() * fences.length)];
        const chance = Math.random();

        // ❌ Absent
        if (chance < 0.1) {
          await Attendance.create({
            userId: emp._id,
            date: dateStr,
            status: 'absent',
          });
          continue;
        }

        // ⏰ Late / Normal
        const isLate = chance < 0.3;
        const lateMinutes = isLate ? rand(15, 60) : 0;

        const checkIn = setMinutes(
          setHours(new Date(currentDate), 9),
          lateMinutes,
        );
        const checkOut = setMinutes(
          setHours(new Date(currentDate), 17),
          rand(0, 10),
        );

        const attendance = await Attendance.create({
          userId: emp._id,
          date: dateStr,
          checkIn,
          checkOut,
          status: isLate ? 'late' : 'checked-out',
          lateByMinutes: lateMinutes,
        });

        // 🔥 LOCATION TRACKING (EVERY 2 MIN)
        const locations = [];

        const intervalMinutes = 2;
        const totalMinutes = 8 * 60; // 9AM–5PM
        const totalPoints = totalMinutes / intervalMinutes;

        for (let i = 0; i < totalPoints; i++) {
          const lat = fence.latitude + jitter();
          const lng = fence.longitude + jitter();

          const logTime = new Date(checkIn);
          logTime.setMinutes(logTime.getMinutes() + i * intervalMinutes);

          locations.push({
            coordinates: {
              type: 'Point',
              coordinates: [lng, lat], // [lng, lat]
            },
            timestamp: logTime,
          });
        }

        // ✅ ONE DOCUMENT PER DAY
        await LocationLog.create({
          userId: emp._id,
          attendanceId: attendance._id,
          date: dateStr,
          locations,
        });
      }
    }

    console.log('✅ SEED COMPLETE');
    console.log('📊 1 log per day per employee');
    console.log('📍 ~240 location points per day (2-min tracking)');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seed();
