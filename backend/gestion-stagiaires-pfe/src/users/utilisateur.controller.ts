import { Controller, Post,Get,Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, ParseIntPipe, Put } from "@nestjs/common";
import { UsersService } from "./utilisateur.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { Utilisateur } from "./entities/utilisateur.entity";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true })) // Valide et transforme le DTO
  async create(@Body() createUserDto: CreateUserDto) {
    // On appelle le service pour l'insertion réelle en BDD
    return await this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profil/:id')
  getProfil(@Param('id') id: number) {
    return this.usersService.getProfil(id);
  }

  @Patch('update-password')
  async changePassword(@Body() body: any) {
    const { userId, oldPassword, newPassword } = body;
    await this.usersService.updatePassword(userId, oldPassword, newPassword);
    return { message: 'Mot de passe modifié avec succès' };
  }
  
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Utilisateur>
  ) {
    // On passe l'ID et les données reçues au service
    return await this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Optionnel : restreindre aux admins
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }

  @Get('role/:role')
  async findByRole(@Param('role') role: string) {
    return await this.usersService.findByRole(role);
  }

}