// frontend/services/adminApi.ts

/*import { api } from './api';

// If you need types, you can import them from api.ts
import type {
  DashboardStats,
  VerificationRequest,
  Property,
  Sitter,
  AuditLog,
  SystemStats,
  PaginatedResponse
} from './api';

export const adminApi = {
  // ========== Dashboard ==========
  getDashboardStats: () => 
    api.getAdminStats(),
  
  // ========== Verifications ==========
  getPendingVerifications: (params?: {
    type?: string;
    page?: number;
    limit?: number;
  }) => 
    api.getPendingVerifications(params),
  
  getPendingProperties: (params?: {
    page?: number;
    limit?: number;
  }) => 
    api.getPendingProperties(params),
  
  getPendingSitters: (params?: {
    page?: number;
    limit?: number;
  }) => 
    api.getPendingSitters(params),
  
  // ========== Actions ==========
  verifyEntity: (entityType: string, entityId: string, data: {
    action: 'approve' | 'reject';
    notes: string;
  }) =>
    api.verifyEntity(entityType, entityId, data),
  
  addVerificationNotes: (entityType: string, entityId: string, notes: string) =>
    api.addVerificationNotes(entityType, entityId, notes),
  
  requestMoreInfo: (entityType: string, entityId: string, message: string) =>
    api.requestMoreInfo(entityType, entityId, message),
  
  // ========== Details ==========
  getUserDetails: (userId: string) => 
    api.getUserDetails(userId),
  
  getPropertyDetails: (propertyId: string) => 
    api.getPropertyDetails(propertyId),
  
  // ========== Audit Logs ==========
  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    action_type?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
  }) => 
    api.getAuditLogs(params),
  
  // ========== Analytics ==========
  getSystemStats: () => 
    api.getSystemStats(),
};

// Optional: Export types for better TypeScript support
export type {
  DashboardStats,
  VerificationRequest,
  Property,
  Sitter,
  AuditLog,
  SystemStats,
  PaginatedResponse
};

*/