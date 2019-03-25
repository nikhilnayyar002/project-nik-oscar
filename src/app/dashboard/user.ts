    export class User {
    
          uid:string;
          email:string;
          emailVerified:boolean;
          name:string;
          image:string;
          about:string;
          phone:string;
          privacy: { 
            show_email:boolean,
            show_about:boolean,
            show_phone:boolean,
            show_image:boolean,
            show_bgImage:boolean,           
            show_group:boolean
          };
          bgY:string;
    } 