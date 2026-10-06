import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';

@Injectable()
export class MongodbService {
  private connection: mongoose.Connection;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/looloo';
      const conn = await mongoose.connect(mongoUri);
      this.connection = conn.connection;
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB Connection Error:', error);
    }
  }

  async getAccountBalance(accountId: string): Promise<any> {
    try {
      // Query accounts collection
      const db = this.connection.getClient().db('looloo');
      const account = await db.collection('accounts').findOne({
        _id: new mongoose.Types.ObjectId(accountId),
      });
      return account;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw error;
    }
  }

  async getMemberBalance(memberId: string): Promise<any> {
    try {
      const db = this.connection.getClient().db('looloo');
      const member = await db.collection('members').findOne({
        _id: new mongoose.Types.ObjectId(memberId),
      });
      return member;
    } catch (error) {
      console.error('Error fetching member balance:', error);
      throw error;
    }
  }

  async getTourPaymentStatus(tourId: string): Promise<any> {
    try {
      const db = this.connection.getClient().db('looloo');
      const tour = await db.collection('tours').findOne({
        _id: new mongoose.Types.ObjectId(tourId),
      });
      return tour;
    } catch (error) {
      console.error('Error fetching tour payment status:', error);
      throw error;
    }
  }

  async getAllMembersWithBalance(): Promise<any> {
    try {
      const db = this.connection.getClient().db('looloo');
      const members = await db.collection('members').find({}).toArray();
      return members;
    } catch (error) {
      console.error('Error fetching all members:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}
