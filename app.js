const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mit-secret',
  resave: false,
  saveUninitialized: true
}));

// Dữ liệu mẫu
const mitList = [
  { id: 1, name: 'Mít Thái', price: 50000, image: '/images.jpg', desc: 'Mít Thái thơm ngon, ngọt lịm.' },
  { id: 2, name: 'Mít Tố Nữ', price: 60000, image: '/images.jpg', desc: 'Mít Tố Nữ dẻo, vị đặc trưng.' },
  { id: 3, name: 'Mít Nghệ', price: 55000, image: '/images.jpg', desc: 'Mít Nghệ vàng óng, múi to, thơm.' },
  { id: 4, name: 'Mít Không Hạt', price: 70000, image: '/images.jpg', desc: 'Mít không hạt, ăn tiện lợi, vị ngọt thanh.' },
  { id: 5, name: 'Mít Mật', price: 65000, image: '/images.jpg', desc: 'Mít mật dẻo, vị ngọt đậm.' },
  { id: 6, name: 'Mít Siêu Ngọt', price: 80000, image: '/images.jpg', desc: 'Mít siêu ngọt, thơm lừng, hấp dẫn.' }
];

// Route trang chủ
app.get('/', (req, res) => {
  res.render('index', { mitList });
});

// Route thêm vào giỏ hàng
app.post('/add-to-cart', (req, res) => {
  const { id } = req.body;
  const mit = mitList.find(m => m.id == id);
  if (!mit) return res.redirect('/');
  if (!req.session.cart) req.session.cart = [];
  const cart = req.session.cart;
  const found = cart.find(item => item.id == id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...mit, qty: 1 });
  }
  res.redirect('/cart');
});

// Route xem giỏ hàng
app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  let total = 0;
  cart.forEach(item => total += item.price * item.qty);
  res.render('cart', { cart, total });
});

// Route chi tiết sản phẩm
app.get('/product/:id', (req, res) => {
  const product = mitList.find(m => m.id == req.params.id);
  if (!product) return res.redirect('/');
  res.render('product', { product, mitList });
});

// Route trang shop
app.get('/shop', (req, res) => {
  res.render('shop', { mitList });
});

// Route trang giới thiệu
app.get('/about', (req, res) => {
  res.render('about');
});

// Route trang tin tức
app.get('/news', (req, res) => {
  res.render('news');
});

// Route trang thanh toán
app.get('/checkout', (req, res) => {
  const cart = req.session.cart || [];
  let total = 0;
  cart.forEach(item => total += item.price * item.qty);
  res.render('checkout', { cart, total });
});

// Route đặt hàng
app.post('/order', (req, res) => {
  const cart = req.session.cart || [];
  let total = 0;
  cart.forEach(item => total += item.price * item.qty);
  // Giả lập đơn hàng
  const order = {
    code: Math.floor(Math.random() * 1000) + 100,
    date: new Date().toLocaleDateString('vi-VN'),
    items: cart,
    total,
    method: req.body.method === 'cod' ? 'Trả tiền mặt khi nhận hàng' : 'Chuyển khoản ngân hàng'
  };
  req.session.order = order;
  req.session.cart = [];
  res.redirect('/order-detail');
});

// Route chi tiết đơn hàng
app.get('/order-detail', (req, res) => {
  const order = req.session.order;
  if (!order) return res.redirect('/');
  res.render('order_detail', { order });
});

// Route trang đăng nhập
app.get('/login', (req, res) => {
  res.render('login');
});

// Xử lý đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'nguyenvanduy' && password === '123456') {
    req.session.user = { username };
    return res.redirect('/');
  } else {
    return res.render('login', { error: 'Sai tài khoản hoặc mật khẩu!' });
  }
});

// Route trang liên hệ
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Xử lý gửi liên hệ
app.post('/contact', (req, res) => {
  // Ở đây có thể xử lý lưu DB hoặc gửi email, demo chỉ hiển thị thông báo
  res.render('contact', { success: true });
});

// Route cập nhật giỏ hàng (tăng, giảm, xóa)
app.post('/update-cart', (req, res) => {
  const { act, id } = req.query;
  if (!req.session.cart) req.session.cart = [];
  const cart = req.session.cart;
  const idx = cart.findIndex(item => item.id == id);
  if (idx !== -1) {
    if (act === 'inc') {
      cart[idx].qty += 1;
    } else if (act === 'dec') {
      cart[idx].qty -= 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    } else if (act === 'del') {
      cart.splice(idx, 1);
    }
  }
  res.redirect('/cart');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
