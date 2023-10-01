import { promises } from 'fs';
import { join } from 'path';
import __dirname from '../../utils.js';
import getLogger from '../../utils/log.utils.js';

const log = getLogger();

class ProductManager {
  constructor() {
    this.path = join(__dirname, '/data/productos.json');
    this.products = [];
    this.loadProducts();
  }
  // método para traer datos del archivo de productos
  async loadProducts() {
    try {
      const dataJson = await promises.readFile(this.path, 'utf-8');
      if (dataJson) {
        this.products = JSON.parse(dataJson);
        return this.products;
      } else {
        return [];
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      } else {
        log.info('Error al obtener los productos', error);
      }
    }
  }

  // método para guardar datos en el archivo de productos
  async saveProducts() {
    try {
      await promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, 2)
      );
      log.info('Los datos fueron guardados exitosamente');
    } catch (error) {
      log.info(error);
    }
  }

  // método para guardar datos de productos eliminados
  async removeProduct() {
    try {
      await promises.writeFile(
        './removedProducts.json',
        JSON.stringify(this.removed, null, 2)
      );
      log.info('Los datos eliminados fueron guardados exitosamente');
    } catch (error) {
      log.info(error);
    }
  }

  // método para agregar producto
  async addProduct(product) {
    const {
      id,
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = product;

    const existsProduct = this.products.some(
      (product) => product.code === code
    );
    // validación de campo code
    if (existsProduct) {
      log.info(`El producto con código ${code} ya existe`);
      return;
    }
    // validación de campos obligatorios
    const missingAttributes = Object.keys(product).filter(
      (key) => !product[key]
    );
    if (missingAttributes.length > 0) {
      log.info(
        `Error: faltan los siguientes atributos para crear el producto: ${missingAttributes.join(
          ', '
        )}`
      );
      return;
    }
    // agrego producto al array y lo guardo en un archivo json
    this.products.push(product);
    log.info(
      `El producto ${product.title} con id ${product.id} ha sido agregado con éxito`
    );
    await this.saveProducts();
  }

  // método que retorna los productos creados hasta el momento
  async getProducts() {
    await this.loadProducts();
    log.info(this.products);
  }
  // método para buscar productos por id
  async getProductById(productId) {
    await this.loadProducts();
    // Validación de ingreso de id
    if (productId === undefined) {
      log.error('Debe especificar un id de producto');
      return;
    }
    // Validación de existencia de id
    const product = this.products.find((p) => p.id === productId);
    !product ? log.error('Not found') : log.info(product);
  }
  // método para modificar un producto
  async uptadeProduct(productId, newProductData) {
    // Validación de ingreso de id
    if (productId === undefined) {
      log.info('Debe especificar el id del producto a modificar');
      return;
    }
    // Obtengo el primer producto que coincida con el id buscado
    const findProd = this.products.find((p) => p.id === productId);
    // Validación de existencia de id
    if (!findProd) {
      log.error('El producto solicitado no fue encontrado');
      return;
    }
    // Modificación de producto
    const modifiedProduct = { ...findProd, ...newProductData };
    this.products[findProd] = modifiedProduct;
    // Guarda el array modificado en el json
    await this.saveProducts();
    // log.info(productId);
    log.info(
      `El producto con id: ${productId} ha sido actualizado correctamente`
    );
  }

  // método para eliminar un producto
  async deleteProduct(productId) {
    this.loadProducts();
    // Validación de ingreso de id
    if (productId === undefined) {
      log.info('Debe especificar el id del producto a eliminar');
      return;
    }
    // Obtengo el primer producto que coincida con el id buscado
    const findProd = this.products.find((p) => p.id === productId);
    // log.info(findProd);
    // Validación de existencia de id
    if (!findProd) {
      log.error('El producto solicitado no fue encontrado');
      return;
    }
    // Elimina el producto del array
    const productoEliminado = this.products.splice(findProd, 1)[0];
    // Guarda el array modificado en el json
    await this.saveProducts();
    // await this.loadProducts();
    log.info(
      `El producto ${productoEliminado.id} - ${productoEliminado.title} ha sido eliminado`
    );
  }
}

export default ProductManager;
