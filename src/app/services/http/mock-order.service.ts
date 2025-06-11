import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { Order, ClassicResponse } from '../../api/models';

// Mock Order Data
export const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    buyer_id: 'buyer_001',
    seller_id: 'seller_001',
    product_id: 'prod_001',
    quantity: 2,
    total_price: 29.98,
    order_status: 'pending',
    delivery_address: '123 Main St, Lagos, Nigeria',
    order_date: new Date('2024-06-08T10:30:00Z'),
  },
  {
    id: 1002,
    buyer_id: 'buyer_002',
    seller_id: 'seller_002',
    product_id: 'prod_002',
    quantity: 1,
    total_price: 15.99,
    order_status: 'confirmed',
    delivery_address: '456 Victoria Island, Lagos, Nigeria',
    order_date: new Date('2024-06-09T14:15:00Z'),
  },
  {
    id: 1003,
    buyer_id: 'buyer_003',
    seller_id: 'seller_001',
    product_id: 'prod_003',
    quantity: 3,
    total_price: 45.97,
    order_status: 'shipped',
    delivery_address: '789 Ikeja GRA, Lagos, Nigeria',
    order_date: new Date('2024-06-07T09:45:00Z'),
  },
  {
    id: 1004,
    buyer_id: 'buyer_001',
    seller_id: 'seller_003',
    product_id: 'prod_004',
    quantity: 1,
    total_price: 99.99,
    order_status: 'delivered',
    delivery_address: '321 Lekki Phase 1, Lagos, Nigeria',
    order_date: new Date('2024-06-05T16:20:00Z'),
  },
  {
    id: 1005,
    buyer_id: 'buyer_004',
    seller_id: 'seller_002',
    product_id: 'prod_005',
    quantity: 2,
    total_price: 34.5,
    order_status: 'cancelled',
    delivery_address: '654 Yaba, Lagos, Nigeria',
    order_date: new Date('2024-06-06T11:30:00Z'),
  },
  {
    id: 1006,
    buyer_id: 'buyer_005',
    seller_id: 'seller_004',
    product_id: 'prod_006',
    quantity: 4,
    total_price: 78.96,
    order_status: 'processing',
    delivery_address: '987 Surulere, Lagos, Nigeria',
    order_date: new Date('2024-06-10T08:00:00Z'),
  },
  {
    id: 1007,
    buyer_id: 'buyer_002',
    seller_id: 'seller_001',
    product_id: 'prod_007',
    quantity: 1,
    total_price: 25.0,
    order_status: 'accepted',
    delivery_address: '147 Ikoyi, Lagos, Nigeria',
    order_date: new Date('2024-06-08T12:00:00Z'),
  },
  {
    id: 1008,
    buyer_id: 'buyer_006',
    seller_id: 'seller_005',
    product_id: 'prod_008',
    quantity: 5,
    total_price: 125.45,
    order_status: 'pending',
    delivery_address: '258 Gbagada, Lagos, Nigeria',
    order_date: new Date('2024-06-09T19:30:00Z'),
  },
  {
    id: 1009,
    buyer_id: 'buyer_001',
    seller_id: 'seller_001',
    product_id: 'prod_009',
    quantity: 1,
    total_price: 55.0,
    order_status: 'accepted',
    delivery_address: '123 Main St, Lagos, Nigeria',
    order_date: new Date('2024-06-07T14:30:00Z'),
  },
];

@Injectable({
  providedIn: 'root',
})
export class MockOrderService {
  createOrder(order: Order): Observable<HttpResponse<ClassicResponse>> {
    // Simulate creating a new order
    const newOrder = { ...order, id: Date.now() };
    MOCK_ORDERS.push(newOrder);

    const response: ClassicResponse = {
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    };

    return of(
      new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: response,
      })
    ).pipe(delay(500)); // Simulate network delay
  }

  getBuyerOrders(buyerId: string): Observable<Order[]> {
    const buyerOrders = MOCK_ORDERS.filter(
      (order) => order.buyer_id === buyerId
    );
    return of(buyerOrders).pipe(delay(300));
  }

  getSellerAcceptedOrders(sellerId: string): Observable<Order[]> {
    const acceptedOrders = MOCK_ORDERS.filter(
      (order) =>
        order.seller_id === sellerId && order.order_status === 'accepted'
    );
    return of(acceptedOrders).pipe(delay(300));
  }

  getOrderById(orderId: string): Observable<Order> {
    const order = MOCK_ORDERS.find((o) => o.id.toString() === orderId);
    if (order) {
      return of(order).pipe(delay(200));
    } else {
      return throwError(() => new Error(`Order with ID ${orderId} not found`));
    }
  }

  getSellerOrders(sellerId: string): Observable<Order[]> {
    const sellerOrders = MOCK_ORDERS.filter(
      (order) => order.seller_id === sellerId
    );
    return of(sellerOrders).pipe(delay(300));
  }

  cancelOrder(orderId: string): Observable<HttpResponse<ClassicResponse>> {
    const orderIndex = MOCK_ORDERS.findIndex(
      (o) => o.id.toString() === orderId
    );

    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].order_status = 'cancelled';

      const response: ClassicResponse = {
        success: true,
        message: 'Order cancelled successfully',
        data: MOCK_ORDERS[orderIndex],
      };

      return of(
        new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: response,
        })
      ).pipe(delay(400));
    } else {
      return throwError(() => new Error(`Order with ID ${orderId} not found`));
    }
  }

  updateOrderStatus(
    orderId: string,
    status: string
  ): Observable<HttpResponse<ClassicResponse>> {
    const orderIndex = MOCK_ORDERS.findIndex(
      (o) => o.id.toString() === orderId
    );

    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].order_status = status;

      const response: ClassicResponse = {
        success: true,
        message: 'Order status updated successfully',
        data: MOCK_ORDERS[orderIndex],
      };

      return of(
        new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: response,
        })
      ).pipe(delay(400));
    } else {
      return throwError(() => new Error(`Order with ID ${orderId} not found`));
    }
  }

  getOrdersByStatus(
    userId: string,
    status: string,
    userType: 'buyer' | 'seller'
  ): Observable<Order[]> {
    let filteredOrders: Order[];

    if (userType === 'buyer') {
      filteredOrders = MOCK_ORDERS.filter(
        (order) => order.buyer_id === userId && order.order_status === status
      );
    } else {
      filteredOrders = MOCK_ORDERS.filter(
        (order) => order.seller_id === userId && order.order_status === status
      );
    }

    return of(filteredOrders).pipe(delay(300));
  }
}
