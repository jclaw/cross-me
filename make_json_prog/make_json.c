#include <stdio.h>
#include <stdlib.h>


void print_data(int num);

int main()
{
	fprintf(stderr, "level:\n");
	int i;
	scanf("%d", &i);
	fprintf(stderr, "level name:\n");
	char *s;
	scanf("%s", s);

	fprintf(stderr, "height and width (h w):\n");
	int h, w;
	scanf("%d %d", &h, &w);
	
	printf("{\n\t\"board\": {\n");
	printf("\t\t\"name\": \"%s\",\n",s);
	printf("\t\t\"height\": %d,\n",h);
	printf("\t\t\"width\": %d,\n",w);
	printf("\t\t\"row_data\": [\n");
	print_data(h);
	printf("\t\t],\n");
	printf("\t\t\"col_data\": [\n");
	print_data(w);
	printf("\t\t]\n");
	printf("\t}\n");
	printf("}\n");



	return 0;
}

void print_data(int num)
{
	for (int i = 0; i < num - 1; i++) {
		printf("\t\t\t[],\n");
	}
		printf("\t\t\t[]\n");
}
