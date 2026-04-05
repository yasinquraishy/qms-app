import { ApiKey } from './apiKey'
import { ApprovalWorkflow } from './approvalWorkflow'
import { ApprovalWorkflowInstance } from './approvalWorkflowInstance'
import { ApprovalWorkflowInstanceStatus } from './approvalWorkflowInstanceStatus'
import { ApprovalWorkflowInstanceStep } from './approvalWorkflowInstanceStep'
import { ApprovalWorkflowInstanceStepStatus } from './approvalWorkflowInstanceStepStatus'
import { ApprovalWorkflowInstanceStepUserStatus } from './approvalWorkflowInstanceStepUserStatus'
import { ApprovalWorkflowStatus } from './approvalWorkflowStatus'
import { ApprovalWorkflowStep } from './approvalWorkflowStep'
import { ApprovalWorkflowStepRole } from './approvalWorkflowStepRole'
import { ApprovalWorkflowStepUser } from './approvalWorkflowStepUser'
import { ApprovalWorkflowVersion } from './approvalWorkflowVersion'
import { ApprovalWorkflowVersionStatus } from './approvalWorkflowVersionStatus'
import { Asset } from './asset'
import { AssetRequest } from './assetRequest'
import { AssetRequestOnContact } from './assetRequestOnContact'
import { AssetRequestStatus } from './assetRequestStatus'
import { AssetRequestType } from './assetRequestType'
import { AuditLog } from './auditLog'
import { Comment } from './comment'
import { Department } from './department'
import { Document } from './document'
import { DocumentCounter } from './documentCounter'
import { DocumentLink } from './documentLink'
import { DocumentStatus } from './documentStatus'
import { DocumentTemplate } from './documentTemplate'
import { DocumentTemplateStatus } from './documentTemplateStatus'
import { DocumentType } from './documentType'
import { DocumentVersion } from './documentVersion'
import { DocumentVersionStatus } from './documentVersionStatus'
import { FormStatus } from './formStatus'
import { FormTemplate } from './formTemplate'
import { Notification } from './notification'
import { NotificationType } from './notificationType'
import { OptionSet } from './optionSet'
import { Permission } from './permission'
import { PermissionOnRole } from './permissionOnRole'
import { Record } from './record'
import { RecordCounter } from './recordCounter'
import { RecordStatus } from './recordStatus'
import { RelatedStandard } from './relatedStandard'
import { RiskLevel } from './riskLevel'
import { Role } from './role'
import { RoleOnUser } from './roleOnUser'
import { RoleStatus } from './roleStatus'
import { Site } from './site'
import { SiteOnTemplate } from './siteOnTemplate'
import { Supplier } from './supplier'
import { SupplierAsset } from './supplierAsset'
import { SupplierContact } from './supplierContact'
import { SupplierDocument } from './supplierDocument'
import { SupplierOnSite } from './supplierOnSite'
import { SupplierStatus } from './supplierStatus'
import { TaskInstance } from './taskInstance'
import { TaskInstanceStatus } from './taskInstanceStatus'
import { TaskKind } from './taskKind'
import { TaskPriority } from './taskPriority'
import { Team } from './team'
import { User } from './user'
import { UserOnApprovalWorkflowInstanceStep } from './userOnApprovalWorkflowInstanceStep'
import { UserOnDocument } from './userOnDocument'
import { UserOnTeam } from './userOnTeam'

export const db = {
  ApiKey,
  ApprovalWorkflow,
  ApprovalWorkflowInstance,
  ApprovalWorkflowInstanceStatus,
  ApprovalWorkflowInstanceStep,
  ApprovalWorkflowInstanceStepStatus,
  ApprovalWorkflowInstanceStepUserStatus,
  ApprovalWorkflowStatus,
  ApprovalWorkflowStep,
  ApprovalWorkflowStepRole,
  ApprovalWorkflowStepUser,
  ApprovalWorkflowVersion,
  ApprovalWorkflowVersionStatus,
  Asset,
  AssetRequest,
  AssetRequestOnContact,
  AssetRequestStatus,
  AssetRequestType,
  AuditLog,
  Comment,
  Department,
  Document,
  DocumentCounter,
  DocumentLink,
  DocumentStatus,
  DocumentTemplate,
  DocumentTemplateStatus,
  DocumentType,
  DocumentVersion,
  DocumentVersionStatus,
  FormStatus,
  FormTemplate,
  Notification,
  NotificationType,
  OptionSet,
  Permission,
  PermissionOnRole,
  Record,
  RecordCounter,
  RecordStatus,
  RelatedStandard,
  RiskLevel,
  Role,
  RoleOnUser,
  RoleStatus,
  Site,
  SiteOnTemplate,
  Supplier,
  SupplierAsset,
  SupplierContact,
  SupplierDocument,
  SupplierOnSite,
  SupplierStatus,
  TaskInstance,
  TaskInstanceStatus,
  TaskKind,
  TaskPriority,
  Team,
  User,
  UserOnApprovalWorkflowInstanceStep,
  UserOnDocument,
  UserOnTeam,
}
