import {Random} from 'meteor/random'
Accounts.onCreateUser((options, user)=>{
     if (options.profile) {
        user.profile = options.profile;
    }
    if (!user.profile){
        user.profile = {}
    }
    user.profile.hashedUsername = Random.id(4)
    return user
})