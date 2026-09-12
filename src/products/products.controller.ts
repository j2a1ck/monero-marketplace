import {
  Controller,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Post,
  UseGuards,
  Query,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/auth/setMetadata';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { ImageValidationPipe } from 'src/common/pipe/file-validation.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('/')
  listOfProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productService.listOfProducts(+page, +limit);
  }

  @Public()
  @Get('/:productId')
  @HttpCode(HttpStatus.OK)
  getProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.getProduct(productId);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  deleteProduct(
    @Param('id', ParseIntPipe) productId: number,
    @UserId() userId: number,
  ) {
    return this.productService.deleteProduct(productId, userId);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('pics', 6))
  @HttpCode(HttpStatus.OK)
  editProduct(
    @Param('id', ParseIntPipe) productId: number,
    @UserId() userId: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(new ImageValidationPipe())
    pics?: Array<Express.Multer.File>,
  ) {
    if (pics) {
      updateProductDto.pics = pics.map((file) => file.buffer);
    }
    return this.productService.editProduct(
      productId,
      userId,
      updateProductDto.title,
      updateProductDto.description,
      updateProductDto.price,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/')
  @UseInterceptors(FilesInterceptor('pics', 6))
  @HttpCode(HttpStatus.OK)
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UserId() userId: number,
    @UploadedFiles(new ImageValidationPipe())
    pics: Array<Express.Multer.File> = [],
  ) {
    return this.productService.createProduct(
      createProductDto.title,
      createProductDto.description,
      createProductDto.price,
      userId,
      pics,
    );
  }

  @Public()
  @Get('/search')
  @HttpCode(HttpStatus.OK)
  searchProduct(@Query() searchProductDto: SearchProductDto) {
    return this.productService.searchProduct(
      searchProductDto.q,
      searchProductDto.page,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/:productId/comments')
  @HttpCode(HttpStatus.OK)
  createComment(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateCommentDto,
    @UserId() userId: number,
  ) {
    return this.productService.createComment(productId, userId, dto);
  }
}
