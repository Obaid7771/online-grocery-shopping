import { OrderStatus, DeliveryType } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class QueryOrdersDto extends PaginationQueryDto {
    status?: OrderStatus;
    deliveryType?: DeliveryType;
    startDate?: string;
    endDate?: string;
    userId?: string;
}
