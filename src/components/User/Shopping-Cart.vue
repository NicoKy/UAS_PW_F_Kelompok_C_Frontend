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

                <v-btn color="success" dark @click="clearCart"> Clear Cart </v-btn>
                <v-btn color="success" dark @click="checkout"> Checkout </v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="shoppingcart" :search="search">
                <template v-slot:[`item.image`]="{ item }">
                    <img :src="item.image" style="width: 180px; height: 180px" />
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn small class="mr-2" @click="addToCart(item)"> Add To Cart </v-btn>
                </template>
            </v-data-table>
            <v-card-text style="font-size:30px">Total: {{total}}</v-card-text>
        </v-card>

        <v-dialog v-model="dialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Checkout</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.payment" label="Payment" required></v-text-field>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="pay"> Pay </v-btn>
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
            total: null,
            headers: [
                    { text: "Name", align: "start", sortable: true, value: "name"},
                    { text: "Price", value: "price"},
                    { text: "Image", value: "image"},
                    { text: "Quantity", value: "quantity"},
                    { text: "Subtotal", value: "subtotal"},
            ],
            shoppingcart: [],
            form: {
                payment: null,
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
            var url = this.$api + '/shoppingcart';
            this.$http.get(url, {
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token')
                }
            }).then(response => {
                this.shoppingcart = response.data.data;
                this.total = response.data.total;
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

        clearCart() {
            var url = this.$api + '/shoppingcart/';
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
                window.location.reload()
            }).catch(error => {
                this.error_message = error.response.data.message;
                this.color = "red";
                this.snackbar = true;
                this.load = false;
            });
        },

        checkout() {
            this.dialog = true;
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
        pay() {
            if(this.form.payment >= this.total)
            {
                var url = this.$api + '/shoppingcart/';
                this.load = true;
                this.$http.delete(url, {
                    headers: {
                        'Authorization' : 'Bearer ' + localStorage.getItem('token'),
                    }
                }).then(response => {
                this.error_message = response.data.message;
                if(this.error_message == "Shopping Cart Cleared")
                    this.error_message = "Checkout Successful";
                this.color = "green";
                this.snackbar = true;
                this.load = false;
                this.close();
                this.readData();
                this.resetForm();
                this.inputType = 'Tambah';
                window.location.reload()
                }).catch(error => {
                    this.error_message = error.response.data.message;
                    this.color = "red";
                    this.snackbar = true;
                    this.load = false;
                });
            }
            else
            {
                this.error_message = "Insufficient Money";
                this.color = "red";
                this.snackbar = true;
            }
            this.resetForm();
            this.readData();
            this.dialog = false;
        },
        resetForm() {
            this.form = { 
                payment: null,
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