<template>
    <v-main class="list">
        <h3 class="text-h3 font-weight-medium mb-5">Store</h3>

        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                ></v-text-field>

                <v-spacer></v-spacer>

            </v-card-title>
            <v-data-table :headers="headers" :items="products" :search="search">
                <template v-slot:[`item.product_image`]="{ item }">
                    <img :src="item.product_image" style="width: 180px; height: 180px" />
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn small class="mr-2" @click="addToCart(item)"> Add To Cart </v-btn>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="dialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Add To Cart</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.quantity" label="Quantity" required></v-text-field>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="setForm"> Save </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogConfirm" persistent max-width="400px">
            <v-card>
                <v-card-title>
                    <span class="headline">Warning!</span>
                </v-card-title>
                <v-card-text>Anda Yakin ingin menghapus kelas ini?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialogConfirm = false"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="deleteData"> Delete </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>{{ error_message }}</v-snackbar>
    </v-main>
</template>

<script>
export default {
    name: "List",
    data() {
        return {
            inputType: 'Tambah',
            load: false,
            snackbar: false,
            error_message: '',
            color: '',
            search: null,
            dialog: false,
            dialogConfirm: false,
            headers: [
                    { text: "Product Name", align: "start", sortable: true, value: "product_name"},
                    { text: "Product Price", value: "product_price" },
                    { text: "Product Description", value: "product_description" },
                    { text: "Product Category", value: "product_category" },
                    { text: "Product Image", value: "product_image" },
                    { text: "Actions", value: "actions"},
            ],
            shoppingcart: new FormData,
            products: [],
            form: {
                quantity: null,
            },
            cartForm: {
                name: null,
                price: null,
                image: null,
                quantity: null,
            },
            deleteId: '',
            editId: '',
        };
    },
    methods: {
        setForm() {
            if(this.inputType !== 'Tambah'){
                this.update();
            }else{
                this.save();
            }
        },

        readData() {
            var url = this.$api + '/product';
            this.$http.get(url, {
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token')
                }
            }).then(response => {
                this.products = response.data.data;
            })
        },

        save() {
            this.shoppingcart.append('name', this.cartForm.name);
            this.shoppingcart.append('price', this.cartForm.price);
            this.shoppingcart.append('image', this.cartForm.image);
            this.shoppingcart.append('quantity', this.form.quantity);

            var url = this.$api + '/shoppingcart/'
            this.load = true;
            this.$http.post(url, this.shoppingcart, {
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token'),
                }
            }).then(response => {
                this.error_message = response.data.message;
                this.color = "green";
                this.snackbar = true;
                this.load = true;
                this.close();
                this.readData();
                this.resetForm();
            }).catch(error => {
                this.error_message = error.response.data.message;
                this.color = "red";
                this.snackbar = true;
                this.load = false;
            });
        },

        update() {
            let newData = {
                product_name : this.form.product_name,
                product_price : this.form.product_price,
                product_description : this.form.product_description,
                product_category : this.form.product_category,
                product_image : this.form.product_image,
            };
            var url = this.$api + '/product/' + this.editId;
            this.load = true;
            this.$http.put(url, newData, {
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token'),
                }
            }).then(response => {
                this.error_message = response.data.message;
                this.color = "green";
                this.snackbar = true;
                this.load = false;
                this.close();
                this.readData();
                this.resetForm();
                this.inputType = 'Tambah';
            }).catch(error => {
                this.error_message = error.response.data.message;
                this.color = "red";
                this.snackbar = true;
                this.load = false;
            });
        },

        deleteData() {

            var url = this.$api + '/product/' + this.deleteId;
            this.load = true;
            this.$http.delete(url, {
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token'),
                }
            }).then(response => {
                this.error_message = response.data.message;
                this.color = "green";
                this.snackbar = true;
                this.load = false;
                this.close();
                this.readData();
                this.resetForm();
                this.inputType = 'Tambah';
            }).catch(error => {
                this.error_message = error.response.data.message;
                this.color = "red";
                this.snackbar = true;
                this.load = false;
            });
        },
        addToCart(item) {
            this.inputType = 'Tambah';
            this.editId = item.id;
            this.cartForm.name = item.product_name;
            this.cartForm.price = item.product_price;
            this.cartForm.image = item.product_image;
            this.dialog = true;
        },
        deleteHandler(id) {
            this.deleteId = id;
            this.dialogConfirm = true;
        },
        close() {
            this.dialog = false;
            this.inputType = 'Tambah';
            this.dialogConfirm = false;
            this.readData();
        },
        cancel() {
            this.resetForm();
            this.readData();
            this.dialog = false;
            this.dialogConfirm = false;
            this.inputType = 'Tambah';
        },
        resetForm() {
            this.form = { 
                product_name: null,
                product_price: null,
                product_description: null,
                product_category: null,
                product_image: null,
            };
        },
    },
    computed: {
        formTitle(){
            return this.inputType;
        },
    },
    mounted(){
        this.readData();
    },
};
</script>
