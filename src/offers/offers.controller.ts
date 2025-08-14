import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Get,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOfferDto: CreateOfferDto, @Req() req) {
    try {
      const wish = await this.offersService.getWishById(createOfferDto.itemId);
      if (wish.owner.id === req.user.id) {
        throw new ForbiddenException('Нельзя скидываться на свои подарки');
      }

      if (wish.raised >= wish.price) {
        throw new BadRequestException('На подарок уже собрана нужная сумма');
      }

      const remaining = wish.price - wish.raised;
      if (createOfferDto.amount > remaining) {
        throw new BadRequestException(
          `Можно скинуть не более ${remaining} рублей`,
        );
      }

      return this.offersService.create(createOfferDto, req.user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    const offer = await this.offersService.findOne(+id);

    if (offer.hidden && offer.user.id !== req.user.id) {
      throw new ForbiddenException('Нет доступа к просмотру этой заявки');
    }

    return offer;
  }
}
