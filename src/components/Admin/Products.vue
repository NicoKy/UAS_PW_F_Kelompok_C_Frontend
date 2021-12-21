<template>
    <v-main class="list">
        <h3 class="text-h3 font-weight-medium mb-5">Products</h3>

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

                <v-btn color="success" dark @click="dialog = true"> Add </v-btn>

            </v-card-title>
            <v-data-table :headers="headers" :items="products" :search="search">
                <template v-slot:[`item.product_image`]="{ item }">
                    <img :src="item.product_image" style="width: 180px; height: 180px" />
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn small class="mr-2" @click="editHandler(item)"> edit </v-btn>
                    <v-btn small @click="deleteHandler(item.id)"> delete </v-btn>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="dialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }} Product</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field v-model="form.product_name" label="Product Name" required></v-text-field>
                        <v-text-field v-model="form.product_price" label="Product Price" required></v-text-field>
                        <v-text-field v-model="form.product_description" label="Product Description" required></v-text-field>
                        <v-text-field v-model="form.product_category" label="Product Category" required></v-text-field>
                        <v-text-field v-model="form.product_image" label="Product Image Link" required></v-text-field>
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
            product: new FormData,
            products: [],
            form: {
                product_name: null,
                product_price: null,
                product_description: null,
                product_category: null,
                product_image: null,
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
            this.product.append('product_name', this.form.product_name);
            this.product.append('product_price', this.form.product_price);
            this.product.append('product_description', this.form.product_description);
            this.product.append('product_category', this.form.product_category);
            this.product.append('product_image', this.form.product_image);

            var url = this.$api + '/product/'
            this.load = true;
            this.$http.post(url, this.product, {
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
        editHandler(item) {
            this.inputType = 'Ubah';
            this.editId = item.id;
            this.form.product_name = item.product_name;
            this.form.product_price = item.product_price;
            this.form.product_description = item.product_description;
            this.form.product_category = item.product_category;
            this.form.product_image = item.product_image;
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
