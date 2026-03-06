📦src
 ┣ 📂auth
 ┃ ┣ 📂dto
 ┃ ┃ ┣ 📜login.dto.ts
 ┃ ┃ ┗ 📜register.dto.ts
 ┃ ┣ 📂strategies
 ┃ ┃ ┗ 📜jwt.strategy.ts
 ┃ ┣ 📜auth.controller.ts
 ┃ ┣ 📜auth.module.ts
 ┃ ┗ 📜auth.service.ts
 ┣ 📂cart
 ┃ ┣ 📂dto
 ┃ ┃ ┗ 📜cart.dto.ts
 ┃ ┣ 📜cart.controller.ts
 ┃ ┣ 📜cart.module.ts
 ┃ ┗ 📜cart.service.ts
 ┣ 📂categories
 ┃ ┣ 📂dto
 ┃ ┃ ┗ 📜create-category.dto.ts
 ┃ ┣ 📜categories.controller.ts
 ┃ ┣ 📜categories.module.ts
 ┃ ┗ 📜categories.service.ts
 ┣ 📂common
 ┃ ┣ 📂decorators
 ┃ ┃ ┣ 📜current-user.decorator.ts
 ┃ ┃ ┗ 📜roles.decorator.ts
 ┃ ┣ 📂filters
 ┃ ┃ ┗ 📜all-exceptions.filter.ts
 ┃ ┣ 📂guards
 ┃ ┃ ┣ 📜jwt-auth.guard.ts
 ┃ ┃ ┗ 📜roles.guard.ts
 ┃ ┣ 📂helpers
 ┃ ┃ ┗ 📜uuid.helper.ts
 ┃ ┗ 📂interceptors
 ┃ ┃ ┗ 📜response.interceptor.ts
 ┣ 📂orders
 ┃ ┣ 📂dto
 ┃ ┃ ┗ 📜order.dto.ts
 ┃ ┣ 📜orders.controller.ts
 ┃ ┣ 📜orders.module.ts
 ┃ ┗ 📜orders.service.ts
 ┣ 📂prisma
 ┃ ┣ 📜prisma.module.ts
 ┃ ┗ 📜prisma.service.ts
 ┣ 📂products
 ┃ ┣ 📂dto
 ┃ ┃ ┗ 📜product.dto.ts
 ┃ ┣ 📜products.controller.ts
 ┃ ┣ 📜products.module.ts
 ┃ ┗ 📜products.service.ts
 ┣ 📂reviews
 ┃ ┣ 📂dto
 ┃ ┃ ┗ 📜review.dto.ts
 ┃ ┣ 📜reviews.controller.ts
 ┃ ┣ 📜reviews.module.ts
 ┃ ┗ 📜reviews.service.ts
 ┣ 📂users
 ┃ ┣ 📂dto
 ┃ ┃ ┗ 📜update-user.dto.ts
 ┃ ┣ 📜users.controller.ts
 ┃ ┣ 📜users.module.ts
 ┃ ┗ 📜users.service.ts
 ┣ 📜app.controller.spec.ts
 ┣ 📜app.controller.ts
 ┣ 📜app.module.ts
 ┣ 📜app.service.ts
 ┗ 📜main.ts