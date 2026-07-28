import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  Header,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  
  // Sample data
  private users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'John Moe' },
  ];

  // GET /user?name=john
  @Get()
  getUsers(@Query('name') name?: string) {
    if (name) {
      return this.users.filter((user) =>
        user.name.toLowerCase().includes(name.toLowerCase()),
      );
    }
    return this.users;
  }

  // GET /user/search?name=john&age=20  (multiple query params as object)
  @Get('search')
  search(@Query() query: { name?: string; age?: string }) {
    return query;
  }

  // GET /user/:id  -> must come AFTER /user/search or "search" gets treated as :id
  @Get(':id')
  getUserById(@Param('id') id: string) {
    const userId = Number(id);
    return this.users.find((u) => u.id === userId) ?? null;
  }

  // GET /user/:id/orders/:orderId  (multiple route params)
  @Get(':id/orders/:orderId')
  getUserOrder(@Param('id') id: string, @Param('orderId') orderId: string) {
    return { id, orderId };
  }

  // GET /user/:id/orders/:orderId (destructured params object instead)
  @Get(':id/orders/:orderId/alt')
  getUserOrderAlt(@Param() params: { id: string; orderId: string }) {
    return params;
  }

  // POST /user
  @Post()
  @HttpCode(HttpStatus.CREATED) // default is 201 for POST anyway, shown for reference
  createUser(@Body() CreateUserDto: CreateUserDto) {
    const newUser = { id: this.users.length + 1, name: CreateUserDto.name };
    this.users.push(newUser);
    return newUser;
  }

  // PUT /user/:id  (full replace)
  @Put(':id')
  replaceUser(@Param('id') id: string, @Body() body: { name: string }) {
    return { id, ...body };
  }

  // PATCH /user/:id  (partial update)
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string }>,
  ) {
    return { id, ...body };
  }

  // DELETE /user/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204, no response body
  deleteUser(@Param('id') id: string) {
    this.users = this.users.filter((u) => u.id !== Number(id));
  }

  // Reading headers
  @Get('me/info')
  getInfo(@Headers('authorization') auth: string, @Headers() allHeaders: any) {
    return { auth, allHeaders };
  }

  // Setting a response header
  @Get('me/custom-header')
  @Header('X-Custom-Header', 'some-value')
  withHeader() {
    return { ok: true };
  }

  // Raw Express Request/Response (escape hatch, avoid unless necessary)
  @Get('me/raw')
  raw(@Req() req: Request, @Res() res: Response) {
    // when using @Res(), Nest no longer handles the response for you —
    // you must call res.send()/res.json() yourself
    res.status(200).json({ path: req.path });
  }
}