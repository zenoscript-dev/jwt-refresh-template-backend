// import { CanActivate, ExecutionContext, Injectable, Inject, CACHE_MANAGER, Logger } from '@nestjs/common';
// import { Cache } from 'cache-manager';
// import { Reflector } from '@nestjs/core';
// import { UserRepositoryService } from 'src/user/service/userrepository.service';
// import { RoleConstants } from '../constants/auth.constants';

// @Injectable()
// export class PermissionsGuard implements CanActivate {

//   constructor(private readonly reflector: Reflector,
//     private logger: Logger,
//     private repositoryService: UserRepositoryService,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

//   async canActivate(
//     context: ExecutionContext,
//   ) {
//     const routePermissions = this.reflector.get<string[]>(
//       'permissions',
//       context.getHandler(),
//     );

//     if (!routePermissions) {
//       return true;
//     }

//     const user = context.getArgs()[0].user;

//     this.logger.log(' context.getArgs()[0] : ' + JSON.stringify(user), PermissionsGuard.name);

//     const permissions=  user.permissions;
//     // permissions is sent in jwt token, it will preceeds all other things and check will be done aganist the permissions present in jwt token
//     if(permissions && permissions.length > 0) {
//       const hasPermission = routePermissions.some(element => {
//         return permissions.includes(element);
//       });
//       this.logger.log(' permissions #### hasPermission : ' + hasPermission, PermissionsGuard.name);
//       return hasPermission;
//     }


//     let userPermissionsSet = new Set();
//     if (user.permissions) {
//        for (let index = 0; index < user.permissions.length; index++) {
//         const permission = user.permissions[index];
//         userPermissionsSet.add(permission);
//        }
//     } else {

//       const userRoles = user.roles;

//       // allow everything for super user
//       if(userRoles.includes(RoleConstants.SUPERADMIN_ROLE)){
//         const excludedPermissionIds = []
//         const excludedPermissions = await this.repositoryService.getAllAdminExcludedPermissions(user.namespace);
//         for (let index = 0; index < excludedPermissions.length; index++) {
//           const excludedPermission = excludedPermissions[index];
//           excludedPermissionIds.push(excludedPermission.id);
//         }
//         const permissionExluded = routePermissions.some(element => {
//           return excludedPermissionIds.includes(element);
//         });
        
//         return !permissionExluded;
//       }

//       for (let index = 0; index < userRoles.length; index++) {
//         const userRole = userRoles[index];
//         let userPerms =[];
//        // let userPerms = await this.cacheManager.get<string[]>(user.namespace + ":" + userRole);
//         if (!(userPerms && userPerms.length > 0)) {
//           const deptRole = userRole.split(":");
//           const deptId = deptRole[0];
//           const roleId = deptRole[1];
//           const perms = await this.repositoryService.loadAllPermissionsByRoleId(user.namespace, roleId);
//           await this.cacheManager.set(user.namespace + ":" + deptId + ":" + roleId, perms, { ttl: 0 });
//           userPerms = perms;
//         }
//         for (let index = 0; index < userPerms.length; index++) {
//           const permission = userPerms[index];
//           userPermissionsSet.add(permission);
//         }
//       }
//     }


//     const userPermissions = Array.from(userPermissionsSet);
//     this.logger.log(' #### userPermissions : ' + userPermissions + " ###### Required Permission : " + routePermissions, PermissionsGuard.name);

//     const hasPermission = routePermissions.some(element => {
//       return userPermissions.includes(element);
//     });

//     this.logger.log(' #### hasPermission : ' + hasPermission, PermissionsGuard.name);
//     return hasPermission;
//   }
// }