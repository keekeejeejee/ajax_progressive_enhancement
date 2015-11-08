// require dependencies
var express = require('express'),
	multipart = require('connect-multiparty'),
	exphbs = require('express3-handlebars'),
	bodyParser = require('body-parser');
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	flash = require('connect-flash');

// instantiate express app
var app = express();

// set up middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(multipart());
app.use(cookieParser());
app.use(session({secret: 'heybuddy'}));
app.use(flash());

// set up handlebars view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// set up routes
app.get('/', function(req, res) {
	res.render('signup', {
		error: req.flash('signupError'),
		username: req.flash('username'),
		firstName: req.flash('firstName'),
		lastName: req.flash('lastName'),
		email: req.flash('email'),
	});
});

app.post('/signup', function(req, res) {
	// check that required fields are populated
	if (!req.body.username || !req.body.password1 || !req.body.password2 || !req.body.email) {
		req.flash('signupError', 'Please fill in all fields marked with a *');
		bodyToFlash(req);
		res.redirect('/')
	}

	// check that username is not already taken
	// since this is just an example, we're not doing any database queries,
	// we're just doing a quick check with an if statement. this is unrealistic!
	if (req.body.username === 'cole' || req.body.username === 'parzival') {
		req.flash('signupError', 'Sorry, but the username ' + req.body.username + ' is already taken.')
		bodyToFlash(req, 'username');
		res.redirect('/');
	}

	// check that email is not already taken
	// since this is just an example, we're not doing any database queries,
	// we're just doing a quick check with an if statement. this is unrealistic!
	if (req.body.email === 'colejackowski@gmail.com' || req.body.email === 'parzival@oasis.oa') {
		req.flash('signupError', 'Sorry, but the email address ' + req.body.email + ' is already in use.');
		bodyToFlash(req, 'email');
		res.redirect('/');
	}

	// check that passwords match
	if (req.body.password1 !== req.body.password2) {
		req.flash('signupError', 'Passwords do not match.');
		bodyToFlash(req);
		res.redirect('/');
	}

	// all is well, create the user
	// again, we're not actually adding the user to a database in this example
	// nor are we saving the uploaded image to the file system
	// we'll just display the data we received as proof that it went through
	res.render('success', {
		username: req.body.username,
		password1: req.body.password1,
		password2: req.body.password2,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		imageName: (req.files.image ? req.files.image.name : req.flash('imageName') + ' (ajax upload)'), // use flash data in case
		imageSize: (req.files.image ? req.files.image.size : req.flash('imageSize') + ' (ajax upload)'), // of ajax image upload
	});
});

app.post('/check-username', function(req, res) {
	// we'd normally run a check against the database to test the username for
	// uniqueness, but we're not going to in this example
	if (req.body.username === 'cole' || req.body.username === 'parzival') {
		res.json({taken: true});
	} else {
		res.json({taken: false});
	}
});

app.post('/check-email', function(req, res) {
	// we'd normally run a check against the database to test the email for
	// uniqueness, but we're not going to in this example
	if (req.body.email === 'colejackowski@gmail.com' || req.body.email === 'parzival@oasis.oa') {
		res.json({taken: true});
	} else {
		res.json({taken: false});
	}
});

app.post('/upload-image', function(req, res) {
	// we'd normally put this image in a temporary directory to be used once the user is
	// successfully signed up, but for this example we'll just hold onto some of its info
	// with flash, just to show later that the ajax upload did work
	if (req.files.image) {
		req.flash('imageName', req.files.image.name);
		req.flash('imageSize', req.files.image.size);
		res.json({received: true});
	} else {
		res.json({received: false})
	}
});

var server = app.listen(process.env.PORT || 8080, function() {
	var port = server.address().port;
	console.log('App listening at http://localhost:' + port);
});

// helper function to pass request body values into flash()
function bodyToFlash(req, leaveOut) {
	for (var key in req.body) {
		if (key === 'password1') continue;
		if (key === 'password2') continue;
		if (leaveOut && key === leaveOut) continue;
		req.flash(key, req.body[key]);
	}
}