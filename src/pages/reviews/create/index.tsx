import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import { useFormik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { useRouter } from 'next/router';
import { createReview } from 'apiSdk/reviews';
import { Error } from 'components/error';
import { reviewValidationSchema } from 'validationSchema/reviews';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { CustomerInterface } from 'interfaces/customer';
import { RestaurantInterface } from 'interfaces/restaurant';
import { getCustomers } from 'apiSdk/customers';
import { getRestaurants } from 'apiSdk/restaurants';
import { ReviewInterface } from 'interfaces/review';

function ReviewCreatePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSubmit = async (values: ReviewInterface, { resetForm }: FormikHelpers<any>) => {
    setError(null);
    try {
      await createReview(values);
      resetForm();
    } catch (error) {
      setError(error);
    }
  };

  const formik = useFormik<ReviewInterface>({
    initialValues: {
      rating: 0,
      comment: '',
      customer_id: (router.query.customer_id as string) ?? null,
      restaurant_id: (router.query.restaurant_id as string) ?? null,
    },
    validationSchema: reviewValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Create Review
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {error && <Error error={error} />}
        <form onSubmit={formik.handleSubmit}>
          <FormControl id="rating" mb="4" isInvalid={!!formik.errors?.rating}>
            <FormLabel>Rating</FormLabel>
            <NumberInput
              name="rating"
              value={formik.values?.rating}
              onChange={(valueString, valueNumber) =>
                formik.setFieldValue('rating', Number.isNaN(valueNumber) ? 0 : valueNumber)
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {formik.errors.rating && <FormErrorMessage>{formik.errors?.rating}</FormErrorMessage>}
          </FormControl>
          <FormControl id="comment" mb="4" isInvalid={!!formik.errors?.comment}>
            <FormLabel>Comment</FormLabel>
            <Input type="text" name="comment" value={formik.values?.comment} onChange={formik.handleChange} />
            {formik.errors.comment && <FormErrorMessage>{formik.errors?.comment}</FormErrorMessage>}
          </FormControl>
          <AsyncSelect<CustomerInterface>
            formik={formik}
            name={'customer_id'}
            label={'Customer'}
            placeholder={'Select Customer'}
            fetcher={getCustomers}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record.user_id}
              </option>
            )}
          />
          <AsyncSelect<RestaurantInterface>
            formik={formik}
            name={'restaurant_id'}
            label={'Restaurant'}
            placeholder={'Select Restaurant'}
            fetcher={getRestaurants}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record.name}
              </option>
            )}
          />
          <Button isDisabled={!formik.isValid || formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
            Submit
          </Button>
        </form>
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'review',
  operation: AccessOperationEnum.CREATE,
})(ReviewCreatePage);
