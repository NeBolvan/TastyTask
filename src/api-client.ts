import axios, { AxiosInstance } from 'axios';
import { Logger } from './logger';
import { Order, OrdersListResponse, OrderDetails } from './types';

export class APIClient {
  private client: AxiosInstance;
  private baseUrl: string = 'https://app.debridge.finance';
  private ordersEndpoint: string = '/api/orders';

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TastyTask-OrdersFetcher/1.0'
      }
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      response => {
        Logger.debug('API Response Success', { 
          status: response.status, 
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length 
        });
        return response;
      },
      error => {
        Logger.error('API Response Error', error, { 
          url: error.config?.url,
          status: error.response?.status 
        });
        return Promise.reject(error);
      }
    );
  }

  async fetchOrdersList(page: number = 1, limit: number = 25): Promise<Order[]> {
    try {
      Logger.info('Fetching orders list', { page, limit });
      
      const response = await this.client.get<OrdersListResponse>(this.ordersEndpoint, {
        params: {
          page,
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      Logger.debug('Orders list fetched successfully', { 
        ordersCount: response.data.orders.length,
        page 
      });

      return response.data.orders;
    } catch (error) {
      Logger.error('Failed to fetch orders list', error, { page, limit });
      throw error;
    }
  }

  async fetchOrderDetails(orderId: string): Promise<OrderDetails> {
    try {
      Logger.debug('Fetching order details', { orderId });
      
      const response = await this.client.get<OrderDetails>(
        `${this.ordersEndpoint}/${orderId}`
      );

      Logger.debug('Order details fetched successfully', { orderId });

      return response.data;
    } catch (error) {
      Logger.error('Failed to fetch order details', error, { orderId });
      throw error;
    }
  }

  /**
   * Fetch all orders with pagination
   * @param limit Number of items per page
   * @param maxPages Maximum number of pages to fetch (undefined = fetch all)
   */
  async fetchAllOrdersWithPagination(limit: number = 25, maxPages?: number): Promise<Order[]> {
    const allOrders: Order[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && (!maxPages || page <= maxPages)) {
      try {
        const orders = await this.fetchOrdersList(page, limit);
        
        if (orders.length === 0) {
          hasMore = false;
          Logger.info('No more orders to fetch');
          break;
        }

        allOrders.push(...orders);
        Logger.info('Fetched page of orders', { page, count: orders.length, total: allOrders.length });

        page++;
      } catch (error) {
        Logger.error('Error fetching page', error, { page });
        hasMore = false;
      }
    }

    Logger.info('Pagination complete', { totalOrders: allOrders.length, pagesProcessed: page - 1 });
    return allOrders;
  }
}

export default APIClient;
