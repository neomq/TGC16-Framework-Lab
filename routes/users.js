const express = require("express");
const router = express.Router();

// import in the Product model
const { User } = require('../models')
// import in forms
const { bootstrapField, createRegistrationForm, createLoginForm } = require('../forms');


router.get('/register', async (req,res)=>{
    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'registerForm': registerForm.toHTML(bootstrapField)
    })
})

// process the registration
router.post('/register', (req, res) => {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async (form) => {
            const user = new User({
                'username': form.data.username,
                'password': form.data.password,
                'email': form.data.email
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'registerForm': form.toHTML(bootstrapField)
            })
        }
    })
})

// login page
router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();

    res.render('users/login', {
        'loginForm': loginForm.toHTML(bootstrapField)
    })
})

// process the login
router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login

            // ...find the user by email and password
            let user = await User.where({
                'email': form.data.email
            }).fetch({
               require:false
            });

            if (!user) {
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                res.redirect('/users/login');
            } else {
                // check if the password matches
                if (user.get('password') === form.data.password) {
                    // add to the session that login succeed

                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('username'));
                    res.redirect('/users/profile');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                    res.redirect('/users/login')
                }
            }
        }, 'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// display details of logged in user
router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile',{
            'userProfile': user
        })
    }

})

// log out
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "Goodbye");
    res.redirect('/users/login');
})

module.exports = router;