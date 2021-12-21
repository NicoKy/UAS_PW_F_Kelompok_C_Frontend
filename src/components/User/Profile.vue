<template>
    <v-main class="list">
        <h3 class="text-h3 font-weight-medium mb-5">Profile</h3>

        <v-card>
            <v-card-title>
                User Profile
                <v-spacer></v-spacer>

                <v-btn color="success" dark @click="update"> Save </v-btn>
            </v-card-title>
            <v-text-field v-model="form.name" label="Name" required outlined></v-text-field>
            <v-text-field v-model="form.email" label="Email" required outlined readonly></v-text-field>
            <v-text-field v-model="form.password" label="Password" required outlined></v-text-field>
            <v-text-field v-model="form.address" label="Address" required outlined></v-text-field>
        </v-card>
        <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>{{ error_message }}</v-snackbar>
    </v-main>
</template>

<style scoped>
    .v-text-field{
    margin-left: 30px;
    margin-right: 30px;
}
</style>

<script>
export default {
    name: "List",
    data() {
        return {
            inputType: 'Tambah',
            userID: localStorage.getItem('id'),
            load: false,
            snackbar: false,
            error_message: '',
            color: '',
            search: null,
            dialog: false,
            dialogConfirm: false,
            headers: [
                    { text: "Name", align: "start", sortable: true, value: "name"},
                    { text: "Email", value: "email" },
                    { text: "Password", value: "password"},
                    { text: "Actions", value: "actions"},
            ],
            user: new FormData,
            users: [],
            form: {
                name: null,
                email: null,
                password: null,
                address: null,
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
            var url = this.$api + '/user';
            this.$http.get(url, {
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token')
                }
            }).then(response => {
                this.users = response.data.data;
            })
        },

        findUser() {
            var url = this.$api + '/user/'+this.userID;
            this.$http.get(url, {
                headers: {
                    'Authorization' : 'Bearer ' + localStorage.getItem('token')
                }
            }).then(response => {
                this.form.name = response.data.data.name;
                this.form.email = response.data.data.email;
                this.form.address = response.data.data.address;
            })
        },

        save() {
            this.user.append('name', this.form.name);
            this.user.append('email', this.form.email);
            this.user.append('password', this.form.password);

            var url = this.$api + '/user/'
            this.load = true;
            this.$http.post(url, this.user, {
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
                name : this.form.name,
                email : this.form.email,
                password : this.form.password,
                address: this.form.address,
            };
            var url = this.$api + '/user/' + this.userID;
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
                this.findUser();
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

            var url = this.$api + '/user/' + this.deleteId;
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
            this.form.name = item.name;
            this.form.email = item.email;
            this.form.password = item.password;
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
                name: null, 
                email: null, 
                password: null,
            };
        },
    },
    computed: {
        formTitle(){
            return this.inputType;
        },
    },
    mounted(){
        this.findUser();
    },
};
</script>