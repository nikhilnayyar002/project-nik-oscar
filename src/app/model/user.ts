export class User {

    id:string;
    email:string;
    emailVerified:boolean;
    name:string;
    image:string;
    bgImage:string;
    detail:string;
    phone:string;
    privacy: {
      showEmail:boolean;
      showAbout:boolean;
      showPhone:boolean;
      showImage:boolean;
      showBgImage:boolean;
      showFriends:boolean;           
    };
    bgY:string='center';
    status:'online' | 'offline';
}
